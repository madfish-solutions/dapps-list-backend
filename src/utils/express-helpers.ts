import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { ArraySchema as IArraySchema, ObjectSchema as IObjectSchema, Schema, ValidationError } from 'yup';

import { basicAuth } from '../middlewares/basic-auth.middleware';
import { CodedError } from './errors';
import logger from './logger';
import { evmQueryParamsSchema } from './schemas';

interface ObjectStorageMethods<V> {
  getByKey: (key: string) => Promise<V>;
  getAllValues: () => Promise<Record<string, V>>;
  upsertValues: (newValues: Record<string, V>) => Promise<'OK'>;
  removeValues: (keys: string[]) => Promise<number>;
}

type TypedBodyRequestHandler<T> = (
  req: Request<Record<string, string>, unknown, T>,
  res: Response,
  next: NextFunction
) => void;

export const withBodyValidation =
  <T>(schema: Schema<T>, handler: TypedBodyRequestHandler<T>): RequestHandler =>
  async (req, res, next) => {
    try {
      req.body = await schema.validate(req.body);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).send({ error: error.message });
      }

      throw error;
    }

    return handler(req, res, next);
  };

interface EvmQueryParams {
  walletAddress: string;
  chainId: string;
}

type TypedEvmQueryRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  evmQueryParams: EvmQueryParams
) => void;

export const withEvmQueryValidation =
  (handler: TypedEvmQueryRequestHandler): RequestHandler =>
  async (req, res, next) => {
    let evmQueryParams: EvmQueryParams;

    try {
      evmQueryParams = await evmQueryParamsSchema.validate(req.query);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).send({ error: error.message });
      }

      throw error;
    }

    return handler(req, res, next, evmQueryParams);
  };

export const withExceptionHandler =
  (handler: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      logger.error(error as object);
      res.status(500).send({ error });
    }
  };

export const withCodedExceptionHandler =
  (handler: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      logger.error(error);

      if (error instanceof CodedError) {
        res.status(error.code).send(error.buildResponse());
      } else {
        res.status(500).send({ message: error?.message });
      }
    }
  };

interface ObjectStorageMethodsEntrypointsConfig<StoredValue, ObjectResponse, ValueResponse> {
  path: string;
  methods: ObjectStorageMethods<StoredValue>;
  keyName: string;
  objectValidationSchema: IObjectSchema<Record<string, StoredValue>>;
  keysArrayValidationSchema: IArraySchema<string[], object>;
  successfulRemovalMessage: (removedEntriesCount: number) => string;
  objectTransformFn: (value: Record<string, StoredValue>, req: Request) => ObjectResponse;
  valueTransformFn: (value: StoredValue, req: Request) => ValueResponse;
}

export const addObjectStorageMethodsToRouter = <
  StoredValue,
  ObjectResponse = Record<string, StoredValue>,
  ValueResponse = StoredValue
>(
  router: Router,
  config: ObjectStorageMethodsEntrypointsConfig<StoredValue, ObjectResponse, ValueResponse>
) => {
  const {
    path,
    methods,
    keyName,
    objectValidationSchema,
    keysArrayValidationSchema,
    successfulRemovalMessage,
    objectTransformFn,
    valueTransformFn
  } = config;

  router.get(
    path === '/' ? '/raw/all' : `${path}/raw/all`,
    withExceptionHandler(async (_req, res) => {
      const values = await methods.getAllValues();

      res.status(200).send(values);
    })
  );

  router.get(
    path === '/' ? `/:${keyName}/raw` : `${path}/:${keyName}/raw`,
    withExceptionHandler(async (req, res) => {
      const { [keyName]: key } = req.params;

      const value = await methods.getByKey(key);

      res.status(200).header('Cache-Control', 'public, max-age=300').send(value);
    })
  );

  router.get(
    path === '/' ? `/:${keyName}` : `${path}/:${keyName}`,
    withExceptionHandler(async (req, res) => {
      const { [keyName]: key } = req.params;

      const value = await methods.getByKey(key);

      res.status(200).send(valueTransformFn(value, req));
    })
  );

  router
    .route(path)
    .get(
      withExceptionHandler(async (req, res) => {
        const values = await methods.getAllValues();

        res.status(200).header('Cache-Control', 'public, max-age=300').send(objectTransformFn(values, req));
      })
    )
    .post(
      basicAuth,
      withExceptionHandler(
        withBodyValidation(objectValidationSchema, async (req, res) => {
          const validatedValues = req.body;

          await methods.upsertValues(validatedValues);

          res.status(200).send({ message: 'Values have been added successfully' });
        })
      )
    )
    .delete(
      basicAuth,
      withExceptionHandler(
        withBodyValidation(keysArrayValidationSchema, async (req, res) => {
          const removedEntriesCount = await methods.removeValues(req.body);

          res.status(200).send({ message: successfulRemovalMessage(removedEntriesCount) });
        })
      )
    );
};
