import { Transaction } from 'sequelize/types';
import { TowerRaider, TowerRoundAction } from '../../../../../models';
import { theTowerNotifyInPrivate } from '../../../utils';
import { towerEngineReply } from './replies';

export async function processCharge(
  actions: TowerRoundAction[],
  raidersToNotify: TowerRaider[],
  transaction: Transaction
) {
  await Promise.all(
    actions.map(async (action) => {
      const enemy = action._enemy!;
      await enemy.setVisibility(true, transaction);
      await Promise.all(
        raidersToNotify.map((raiderToNotify) =>
          theTowerNotifyInPrivate(
            towerEngineReply.enemyWillCharge(enemy),
            raiderToNotify._user!.slackId!
          )
        )
      );
      await action.completeRoundAction(transaction);
    })
  );
}
