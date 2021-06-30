export { prettifyConfig } from './prettifyConfig';

interface NameToType {
  // PROCESS
  ENV: 'production' | 'staging' | 'development' | 'test';
  NODE_ENV: 'production' | 'development';
  // DATABASE
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOSTNAME: string;
  DB_PORT: string;
  // API
  PORT: string;
  HOSTNAME: string;
}

export function getConfig<T extends keyof NameToType>(name: T): NameToType[T];
export function getConfig(name: string): string | number | boolean {
  const val = process.env[name];

  switch (name) {
    case 'NODE_ENV':
      return val || 'development';
    case 'ENV':
      return val || 'development';
  }

  if (!val) {
    throw new Error(`Cannot find environmental variable: ${name}`);
  }

  return val;
}

export const isProd = () => getConfig('ENV') === 'production';

export const isStaging = () => getConfig('ENV') === 'staging';
