import type { RequestRoute } from '@hapi/hapi';
import { camelCase, upperFirst } from 'lodash';

export const routeToLabel = ({ method, path }: RequestRoute): string => {
  const prefix = method.toLowerCase();
  const label = upperFirst(camelCase(path));
  return prefix + label;
};

type Nil<T> = T | undefined | null;
export function defaultToAny<T>(v1: T): T;
export function defaultToAny<T>(v1: Nil<T>, v2: T): T;
export function defaultToAny(v1: Nil<boolean>, v2: boolean): boolean;
export function defaultToAny<T>(v1: Nil<T>, v2: Nil<T>, v3: T): T;
export function defaultToAny(v1: Nil<boolean>, v2: Nil<boolean>, v3: boolean): boolean;
export function defaultToAny<T>(...defaults: Array<Nil<T>>) {
  return defaults.reduce((prev, next) => {
    if (prev === undefined || prev === null || Number.isNaN(prev as unknown as number)) {
      return next;
    }
    return prev;
  });
}
