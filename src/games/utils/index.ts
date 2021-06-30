import { random } from 'lodash';
import { HUNDRED, GAME_TYPE } from '../consts/global';

export function generateRandomNameForGame(gameType: GAME_TYPE) {
  return `${gameType} ${random(HUNDRED)}.${random(HUNDRED)}.${random(HUNDRED)}`
}
