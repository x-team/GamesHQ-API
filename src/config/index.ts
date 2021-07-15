export { prettifyConfig } from './sqlPrettifyConfig';
import { version } from '../../package.json';

interface NameToType {
  // PROCESS
  ENV: 'production' | 'staging' | 'development' | 'test';
  SEED_MODE: 'noseed' | 'seed';
  NODE_ENV: 'production' | 'development';
  // DATABASE
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOSTNAME: string;
  DB_PORT: string;
  // API
  PORT: string;
  HOST: string;
  BUILD_VERSION: string;
  // SLACK
  SLACK_TOKEN: string;
  SLACK_ARENA_XHQ_CHANNEL: string;
  SLACK_ARENA_TOKEN: string;
  SLACK_TOWER_TOKEN: string;
  SLACK_ARENA_SIGNING_SECRET: string;
  SLACK_TOWER_SIGNING_SECRET: string;
  SLACK_CAMPAIGN_SIGNING_SECRET: string;
}

export function getConfig<T extends keyof NameToType>(name: T): NameToType[T];
export function getConfig(name: string): string | number | boolean {
  const val = process.env[name];

  switch (name) {
    case 'NODE_ENV':
      return val || 'development';
    case 'ENV':
      return val || 'development';
    case 'BUILD_VERSION':
      return getConfig('ENV') + '-' + version + '_BUILD_' /*+ versionFile*/;
    case 'SEED_MODE':
      return process.argv.filter((arg) => arg === 'noseed').pop() || 'seed';
  }

  if (!val) {
    throw new Error(`Cannot find environmental variable: ${name}`);
  }

  return val;
}

export const isProd = () => getConfig('ENV') === 'production';

export const isStaging = () => getConfig('ENV') === 'staging';

export * from './logger';
