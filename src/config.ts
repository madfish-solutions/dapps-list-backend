import { getEnv } from './utils/env';
import { isDefined } from './utils/helpers';

export const MIN_IOS_APP_VERSION = '1.20.1027';
export const MIN_ANDROID_APP_VERSION = '1.20.1027';

export const EnvVars = {
  MOONPAY_SECRET_KEY: getEnv('MOONPAY_SECRET_KEY'),
  ALICE_BOB_PRIVATE_KEY: getEnv('ALICE_BOB_PRIVATE_KEY'),
  ALICE_BOB_PUBLIC_KEY: getEnv('ALICE_BOB_PUBLIC_KEY'),
  THREE_ROUTE_API_URL: getEnv('THREE_ROUTE_API_URL'),
  THREE_ROUTE_API_AUTH_TOKEN: getEnv('THREE_ROUTE_API_AUTH_TOKEN'),
  REDIS_URL: getEnv('REDIS_URL'),
  ADMIN_USERNAME: getEnv('ADMIN_USERNAME'),
  ADMIN_PASSWORD: getEnv('ADMIN_PASSWORD')
};

for (const name in EnvVars) {
  if (!isDefined(EnvVars[name])) throw new Error(`process.env.${name} is not set.`);
}
