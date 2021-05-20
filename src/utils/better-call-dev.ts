import DataProvider from "./DataProvider";
import makeBuildQueryFn from "./makeBuildQueryFn";

const BCD_BASE_URL = "https://api.better-call.dev/v1";

type SeriesParams = {
  addresses: string[];
  period: "day" | "month" | "year";
  name: "users" | "operation";
};

type AccountTokenBalancesParams = {
  network: string;
  address: string;
  offset?: number;
  size?: number;
  contract?: string;
};

type ContractTokensParams = {
  address: string;
  network: string;
  size?: number;
  offset?: number;
  token_id?: number;
};

type TokensMetadataParams = {
  size?: number;
  offset?: number;
  network: string;
  contract?: string;
  token_id?: number;
};

type BcdDAppScreenshot = {
  type: string;
  link: string;
};

type DAppsListItem = {
  name: string;
  short_description: string;
  full_description: string;
  website: string;
  slug: string;
  authors: string[];
  social_links: string[] | null;
  interfaces: string[] | null;
  categories: string[];
  soon: boolean;
  logo: string;
  cover: string;
  screenshots?: BcdDAppScreenshot[];
};

export type DAppDetails = DAppsListItem & {
  contracts?: {
    network: string;
    address: string;
  }[];
  tokens?: BcdTokenData[];
  dex_tokens?: BcdTokenData[];
};

type AccountTokenBalancesResponse = {
  balances: (BcdTokenData & {
    balance: string;
  })[];
  total: number;
};

export type BcdTokenData = {
  network: string;
  contract: string;
  token_id: number;
  symbol?: string;
  name?: string;
  decimals: number;
  is_transferable?: boolean;
  is_boolean_amount?: boolean;
  should_prefer_symbol?: boolean;
  extras?: Record<string, any>;
  token_info?: Record<string, any>;
  supply?: string;
};

const buildQuery = makeBuildQueryFn<
  | SeriesParams
  | {}
  | { slug: string }
  | AccountTokenBalancesParams
  | ContractTokensParams,
  | [number, number][]
  | DAppsListItem[]
  | DAppDetails
  | AccountTokenBalancesResponse
  | BcdTokenData[]
>(BCD_BASE_URL, 5);

const getSeries = buildQuery<SeriesParams, [number, number][]>(
  `/stats/mainnet/series`,
  ({ addresses, period, name }) => ({
    address: addresses.join(","),
    period,
    name,
  })
);

export const getDApps = buildQuery<{}, DAppsListItem[]>("/dapps");

const getDAppsDetailsWithoutSeries = buildQuery<{ slug: string }, DAppDetails>(
  ({ slug }) => `/dapps/${slug}`
);
export const getDAppDetails = async ({ slug }: { slug: string }) => {
  const detailsWithoutSeries = await getDAppsDetailsWithoutSeries({ slug });
  if (!detailsWithoutSeries.contracts) {
    return {
      ...detailsWithoutSeries,
      estimatedUsersPerMonth: 0,
    };
  }
  const series = detailsWithoutSeries.contracts
    ? await getSeries({
        addresses: detailsWithoutSeries.contracts
          .filter(({ network }) => network === "mainnet")
          .map(({ address }) => address),
        period: "month",
        name: "users",
      })
    : [];
  const lastSeries = series.slice(-2);
  let estimatedUsersPerMonth = 0;
  if (lastSeries.length === 1) {
    estimatedUsersPerMonth = lastSeries[0][1];
  } else if (lastSeries.length > 1) {
    const [[, prevMonthUsers], [currentMonthTimestamp, currentMonthUsers]] =
      lastSeries;
    const nowTimestamp = Date.now();
    const currentMonthPartMs = nowTimestamp - currentMonthTimestamp;
    const oneWeekMs = 7 * 24 * 3600 * 1000;
    if (currentMonthPartMs < oneWeekMs) {
      estimatedUsersPerMonth = prevMonthUsers;
    } else {
      const nextMonthDate = new Date(currentMonthTimestamp);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const currentMonthUsersEstimation = Math.round(
        ((nextMonthDate.getTime() - currentMonthTimestamp) /
          currentMonthPartMs) *
          currentMonthUsers
      );
      estimatedUsersPerMonth = Math.max(
        Math.round((prevMonthUsers + currentMonthUsersEstimation) / 2),
        currentMonthUsers
      );
    }
  }
  return {
    ...detailsWithoutSeries,
    estimatedUsersPerMonth,
  };
};

export const getAccountTokenBalances = buildQuery<
  AccountTokenBalancesParams,
  AccountTokenBalancesResponse
>(
  (params) => `/account/${params.network}/${params.address}/token_balances`,
  ["offset", "size", "contract"]
);

const getContractTokens = buildQuery<ContractTokensParams, BcdTokenData[]>(
  (params) => `/contract/${params.network}/${params.address}/tokens`,
  ["size", "offset", "token_id"]
);

const getTokensMetadata = buildQuery<TokensMetadataParams, BcdTokenData[]>(
  (params) => `/tokens/${params.network}/metadata`,
  ["size", "offset", "contract", "token_id"]
);

export const tokensMetadataProvider = new DataProvider(
  24 * 3600 * 1000,
  (network: string, address?: string, token_id?: number) =>
    getTokensMetadata({
      network,
      contract: address,
      token_id,
    })
);

export const contractTokensProvider = new DataProvider(
  24 * 3600 * 1000,
  (
    network: string,
    address: string,
    token_id?: number,
    size?: number,
    offset?: number
  ) =>
    getContractTokens({
      network,
      address,
      size,
      offset,
      token_id,
    })
);

export const detailedDAppDataProvider = new DataProvider(
  14 * 60 * 1000,
  (slug: string) => getDAppDetails({ slug })
);