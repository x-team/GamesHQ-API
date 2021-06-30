import { HUNDRED } from '../consts/global';

export function roundTwoDecimalPlaces(num: number): number {
  return Math.round(num * HUNDRED) / HUNDRED;
}