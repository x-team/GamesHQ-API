import type { Transaction } from 'sequelize';
import { ArenaRoundAction } from '../../../../../models';
import { publishArenaMessage } from '../../../utils';
import { gameEngineReply } from './replies';

export async function processHide(actions: ArenaRoundAction[], transaction: Transaction) {
  await Promise.all(
    actions.map(async (action) => {
      const player = action._player!;
      await player.setVisibility(false, transaction);
      await publishArenaMessage(
        gameEngineReply.playerWillHide(player._user!.slackId!, player.health)
      );
      await action.completeRoundAction(transaction);
    })
  );
}
