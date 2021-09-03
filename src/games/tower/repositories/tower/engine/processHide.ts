import type { Transaction } from 'sequelize';
import { TowerRaider, TowerRoundAction } from '../../../../../models';
import { theTowerNotifyInPrivate } from '../../../utils';
import { towerEngineReply } from './replies';

export async function processHide(
  actions: TowerRoundAction[],
  raidersToNotify: TowerRaider[],
  transaction: Transaction
) {
  await Promise.all(
    actions.map(async (action) => {
      const raider = action._raider;
      const enemy = action._enemy;
      if (raider) {
        await raider.setVisibility(false, transaction);
        await theTowerNotifyInPrivate(
          towerEngineReply.raiderWillHide(raider._user!.slackId!, raider.health),
          raider._user!.slackId!
        );
        await action.completeRoundAction(transaction);
      }
      if (enemy) {
        await enemy.setVisibility(false, transaction);
        await Promise.all(
          raidersToNotify.map((raiderToNotify) =>
            theTowerNotifyInPrivate(
              towerEngineReply.enemyWillHide(enemy),
              raiderToNotify._user!.slackId!
            )
          )
        );
        await action.completeRoundAction(transaction);
      }
    })
  );
}
