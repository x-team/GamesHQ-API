import type { Transaction } from 'sequelize';

import type { ArenaRoundAction } from '../../../../../models';
import { publishArenaMessage } from '../../../utils';

import { arenaEngineReply } from './replies';

export async function processHide(actions: ArenaRoundAction[], transaction: Transaction) {
  await Promise.all(
    actions.map(async (action) => {
      const player = action._player!;
      if (!player.isAlive()) {
        await publishArenaMessage(arenaEngineReply.playerLostAction(player._user!.slackId!, true));
        return;
      }
      await player.setVisibility(false, transaction);
      await publishArenaMessage(
        arenaEngineReply.playerWillHide(player._user!.slackId!, player.health)
      );
      await action.completeRoundAction(transaction);
    })
  );
}
