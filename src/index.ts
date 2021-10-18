require("./configure");

import cors from "cors";
import express, { Request, Response } from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import getDAppsStats from "./getDAppsStats";
import { tezExchangeRateProvider } from "./utils/tezos";
import { tokensExchangeRatesProvider } from "./utils/tokens";
import logger from "./utils/logger";
import SingleQueryDataProvider from "./utils/SingleQueryDataProvider";

const PINO_LOGGER = {
  logger: logger.child({ name: "web" }),
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      body: req.body,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
      id: req.id,
    }),
    err: (err) => {
      const { type, message } = pino.stdSerializers.err(err);
      return { type, message };
    },
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
};

const app = express();
app.use(pinoHttp(PINO_LOGGER));
app.use(cors());

const dAppsProvider = new SingleQueryDataProvider(
  15 * 60 * 1000,
  getDAppsStats
);

const getProviderStateWithTimeout = <T>(provider: SingleQueryDataProvider<T>) =>
  Promise.race([
    provider.getState(),
    new Promise<{ data?: undefined; error: Error }>((resolve) =>
      setTimeout(
        () => resolve({ error: new Error("Response timed out") }),
        30000
      )
    ),
  ]);

const makeProviderDataRequestHandler = <T, U>(
  provider: SingleQueryDataProvider<T>,
  transformFn?: (data: T) => U
) => {
  return async (_req: Request, res: Response) => {
    const { data, error } = await getProviderStateWithTimeout(provider);
    if (error) {
      res.status(500).send({ error: error.message });
    } else {
      res.json(transformFn ? transformFn(data!) : data);
    }
  };
};

app.get("/api/dapps", makeProviderDataRequestHandler(dAppsProvider));

app.get(
  "/api/exchange-rates/tez",
  makeProviderDataRequestHandler(tezExchangeRateProvider)
);

app.get("/api/exchange-rates", async (_req, res) => {
  const { data: tokensExchangeRates, error: tokensExchangeRatesError } =
    await getProviderStateWithTimeout(tokensExchangeRatesProvider);
  const { data: tezExchangeRate, error: tezExchangeRateError } =
    await getProviderStateWithTimeout(tezExchangeRateProvider);
  if (tokensExchangeRatesError || tezExchangeRateError) {
    res.status(500).send({
      error: (tokensExchangeRatesError || tezExchangeRateError)!.message,
    });
  } else {
    res.json([
      ...tokensExchangeRates!.map(({ metadata, ...restProps }) => restProps),
      { exchangeRate: tezExchangeRate!.toString() },
    ]);
  }
});

// start the server listening for requests
app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
