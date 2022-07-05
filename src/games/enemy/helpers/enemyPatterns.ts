import type { ARENA_ACTIONS_TYPE } from '../../../models/ArenaRoundAction';
import type { TOWER_ACTIONS_TYPE } from '../../../models/TowerRoundAction';
import { ARENA_ACTIONS, ARENA_ACTION_MAPPING } from '../../arena/consts';
import { GAME_ACTION_MAPPING, GAME_TYPE, SHARED_ACTIONS } from '../../consts/global';
import { TOWER_ACTIONS, TOWER_ACTION_MAPPING } from '../../tower/consts';

export function generateEnemyPatterns(patternLength: number, gameFor: GAME_TYPE) {
  let mutableActionString = '';
  let MUTABLE_ACTIONS_TO_PARSE = SHARED_ACTIONS;

  switch (gameFor) {
    case GAME_TYPE.ARENA:
      MUTABLE_ACTIONS_TO_PARSE = {
        ...MUTABLE_ACTIONS_TO_PARSE,
        ...ARENA_ACTIONS,
      };
      break;
    case GAME_TYPE.TOWER:
      MUTABLE_ACTIONS_TO_PARSE = {
        ...MUTABLE_ACTIONS_TO_PARSE,
        ...TOWER_ACTIONS,
      };
      break;
  }

  Object.values(MUTABLE_ACTIONS_TO_PARSE).forEach((action) => {
    const actionSymbol = parseEnemyActionToSymbol(action);
    if (actionSymbol) {
      mutableActionString += actionSymbol;
    }
  });
  return tree(mutableActionString, patternLength);
}

function parseEnemyActionToSymbol(action: TOWER_ACTIONS_TYPE | ARENA_ACTIONS_TYPE) {
  switch (action) {
    case SHARED_ACTIONS.HUNT:
      return GAME_ACTION_MAPPING.HUNT;
    case SHARED_ACTIONS.HIDE:
      return GAME_ACTION_MAPPING.HIDE;
    case ARENA_ACTIONS.STAY_ON_LOCATION:
      return ARENA_ACTION_MAPPING.STAY_ON_LOCATION;
    case TOWER_ACTIONS.CHARGE:
      return TOWER_ACTION_MAPPING.CHARGE;
    default:
      return undefined;
  }
}

export function parseSymbolToEnemyAction(
  sysmbol: GAME_ACTION_MAPPING | TOWER_ACTION_MAPPING | ARENA_ACTION_MAPPING
) {
  switch (sysmbol) {
    case GAME_ACTION_MAPPING.HUNT:
      return SHARED_ACTIONS.HUNT;
    case GAME_ACTION_MAPPING.HIDE:
      return SHARED_ACTIONS.HIDE;
    case ARENA_ACTION_MAPPING.STAY_ON_LOCATION:
      return ARENA_ACTIONS.STAY_ON_LOCATION;
    case TOWER_ACTION_MAPPING.CHARGE:
      return TOWER_ACTIONS.CHARGE;
    default:
      return undefined;
  }
}

function tree(base: string, depth: number) {
  const branches = base.length;
  const tree: Array<string[]> = [];
  for (let mutableBranch = 0; mutableBranch < branches; mutableBranch++) {
    tree.push(generateBranch(base, base[mutableBranch], mutableBranch, 1, depth));
  }
  const regexp = new RegExp(`.{1,${depth}}`, 'g');
  return tree.join('').match(regexp) as Array<string>;
}

function generateBranch(
  base: string,
  origin: string,
  baseIndex: number,
  currentDepth: number,
  maxDepth: number
): any {
  if (currentDepth === maxDepth) {
    return origin;
  }
  const branches = base.length;
  let mutablePattern = '';
  for (let mutableBranch = 0; mutableBranch < branches; mutableBranch++) {
    mutablePattern += generateBranch(
      base,
      origin + base[mutableBranch],
      baseIndex,
      currentDepth + 1,
      maxDepth
    );
  }
  return mutablePattern;
}
