import { TOWER_ACTIONS_TYPE } from '../../../models/TowerRoundAction';
import { GAME_ACTION_MAPPING } from '../../consts/global';
import { TOWER_ACTIONS } from '../../tower/consts';

export function generateEnemyPatterns(patternLength: number) {
  let mutableActionString = '';
  Object.values(TOWER_ACTIONS).forEach((action) => {
    const actionSymbol = parseEnemyActionToSymbol(action);
    if (actionSymbol) {
      mutableActionString += actionSymbol;
    }
  });
  return tree(mutableActionString, patternLength);
}

function parseEnemyActionToSymbol(action: TOWER_ACTIONS_TYPE) {
  switch (action) {
    case TOWER_ACTIONS.HUNT:
      return GAME_ACTION_MAPPING.HUNT;
    case TOWER_ACTIONS.HIDE:
      return GAME_ACTION_MAPPING.HIDE;
    case TOWER_ACTIONS.CHARGE:
      return GAME_ACTION_MAPPING.CHARGE;
    default:
      return undefined;
  }
}

export function parseSymbolToEnemyAction(sysmbol: GAME_ACTION_MAPPING) {
  switch (sysmbol) {
    case GAME_ACTION_MAPPING.HUNT:
      return TOWER_ACTIONS.HUNT;
    case GAME_ACTION_MAPPING.HIDE:
      return TOWER_ACTIONS.HIDE;
    case GAME_ACTION_MAPPING.CHARGE:
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
