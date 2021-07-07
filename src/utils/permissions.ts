import { USER_ROLE_NAME } from '../consts/model';

export const isScopeRole = (scope: string[] = [], role: USER_ROLE_NAME): boolean => {
  return scope.includes(role);
};
