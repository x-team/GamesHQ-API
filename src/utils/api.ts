import type { RequestRoute } from '@hapi/hapi';
import { camelCase, upperFirst } from 'lodash';

export const routeToLabel = ({ method, path }: RequestRoute): string => {
  const prefix = method.toLowerCase();
  const label = upperFirst(camelCase(path));
  return prefix + label;
};
