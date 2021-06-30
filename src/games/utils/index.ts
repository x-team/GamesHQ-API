import { random } from 'lodash';

import type { GAME_TYPE } from '../consts/global';
import { HUNDRED } from '../consts/global';

export function generateRandomNameForGame(gameType: GAME_TYPE) {
  return `${gameType} ${random(HUNDRED)}.${random(HUNDRED)}.${random(HUNDRED)}`
}
