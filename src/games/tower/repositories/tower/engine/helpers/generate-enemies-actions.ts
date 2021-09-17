import type { Transaction } from 'sequelize';
import { TowerFloorBattlefieldEnemy, TowerRound } from '../../../../../../models';
import { setRoundAction, TOWER_ACTIONS_TYPE } from '../../../../../../models/TowerRoundAction';
import { GAME_ACTION_MAPPING } from '../../../../../consts/global';
import { parseSymbolToEnemyAction } from '../../../../../enemy/helpers/enemyPatterns';
import { TOWER_ACTIONS, TOWER_ACTION_MAPPING } from '../../../../consts';
import { rollEnemyAction } from '../../../../utils';

export async function generateEnemiesActions(
  round: TowerRound,
  enemies: TowerFloorBattlefieldEnemy[],
  transaction: Transaction
) {
  await Promise.all(
    enemies.map(async (enemy) => {
      let mutableAction: TOWER_ACTIONS_TYPE;
      const MAX_REPETITIONS = 2;
      const enemyPatternCounter = enemy.patternCounter;
      const enemyPatternCursor = enemy.patternCursor;
      const enemyPattern = enemy._towerFloorEnemy?._enemy?._enemyPatternId!;
      if (enemyPatternCounter < MAX_REPETITIONS) {
        mutableAction = parseSymbolToEnemyAction(
          enemyPattern[enemyPatternCursor] as GAME_ACTION_MAPPING & TOWER_ACTION_MAPPING
        )! as TOWER_ACTIONS_TYPE;
        await enemy.incrementCursor(enemyPattern.length, transaction);
      } else {
        mutableAction = round.isEveryoneVisible ? TOWER_ACTIONS.HUNT : rollEnemyAction()!;
      }
      await setRoundAction(
        {
          roundId: round.id,
          enemyId: enemy.id,
          action: { id: mutableAction },
        },
        transaction
      );
    })
  );
}
