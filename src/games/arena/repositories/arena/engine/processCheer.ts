import type { Transaction } from 'sequelize';
import { ArenaRound, ArenaRoundAction } from '../../../../../models';
import { findPlayerById } from '../../../../../models/ArenaPlayer';
import { setPlayerPerformanceAction } from '../../../../../models/ArenaPlayerPerformance';
import { ARENA_PLAYER_PERFORMANCE } from '../../../consts';
import { publishArenaMessage } from '../../../utils';
import { cheerAwards } from './cheerSystem';
import { arenaEngineReply } from './replies';

export async function processCheers(
  round: ArenaRound,
  actions: ArenaRoundAction[],
  transaction: Transaction
) {
  const ONE = 1;
  for (const action of actions) {
    const player = action._player!;
    await setPlayerPerformanceAction(
      player.id,
      round._gameId,
      { field: ARENA_PLAYER_PERFORMANCE.CHEERS_GIVEN, value: ONE },
      transaction
    );
    const { targetPlayerId } = action.actionJSON;
    targetStatement: if (targetPlayerId) {
      const targetPlayer = await findPlayerById(targetPlayerId, false, transaction);
      if (!targetPlayer) {
        await publishArenaMessage(
          arenaEngineReply.playerFoundNoHealthKit(player._user!.slackId!, player.health)
        );
        break targetStatement;
      }
      await publishArenaMessage(
        arenaEngineReply.playerCheerSomebody(player, targetPlayer?._user?.slackId!)
      );
      const playerPerformance = await setPlayerPerformanceAction(
        targetPlayer?.id,
        round._gameId,
        { field: ARENA_PLAYER_PERFORMANCE.CHEERS_RECEIVED, value: ONE },
        transaction
      );
      const perkAwarded = await cheerAwards(
        targetPlayer!,
        playerPerformance.cheersReceived,
        transaction
      );
      if (perkAwarded !== undefined) {
        await publishArenaMessage(
          arenaEngineReply.playerReceivedPerk(targetPlayer?._user?.slackId!, perkAwarded)
        );
      }
    }
    await action.completeRoundAction(transaction);
  }
}
