import { Transaction } from 'sequelize/types';
import { ArenaRound, ArenaRoundAction } from '../../../../../models';
import { findPlayerById } from '../../../../../models/ArenaPlayer';
import { setPlayerPerformanceAction } from '../../../../../models/ArenaPlayerPerformance';
import { findHealthkitByName } from '../../../../../models/ItemHealthKit';
import { ZERO } from '../../../../consts/global';
import { ARENA_HEALTHKITS, ARENA_PLAYER_PERFORMANCE, MAX_PLAYER_HEALTH } from '../../../consts';
import { publishArenaMessage } from '../../../utils';
import { arenaEngineReply } from './replies';

export async function processHealOrRevive(
  round: ArenaRound,
  actions: ArenaRoundAction[],
  transaction: Transaction
) {
  const healthKit = await findHealthkitByName(ARENA_HEALTHKITS.COMMON, transaction);
  await Promise.all(
    actions.map(async (action) => {
      const player = action._player!;
      if (round.isEveryoneVisible) {
        await player.setVisibility(true, transaction);
      }
      const healthKitQty = await player.healthkitQty(healthKit?.id ?? ZERO);
      healthKitQtyStatement: if (healthKitQty > ZERO) {
        if (!healthKit) {
          await publishArenaMessage(
            arenaEngineReply.playerFoundNoHealthKit(player._user!.slackId!, player.health)
          );
          break healthKitQtyStatement;
        }
        const usedItemQuantity = 1;
        const { targetPlayerId } = action.actionJSON;
        targetStatement: if (targetPlayerId === player.id) {
          await player.reviveOrHeal(
            healthKit._healthkit?.healingPower ?? ZERO,
            MAX_PLAYER_HEALTH,
            transaction
          );
          await player.subtractHealthkit(healthKit.id, usedItemQuantity, transaction);
          await publishArenaMessage(
            arenaEngineReply.playerSelfRevive(player._user!.slackId!, action._player!.health)
          );
        } else {
          if (!targetPlayerId) {
            await publishArenaMessage(
              arenaEngineReply.playerTryReviveButFailed(player._user!.slackId!, player.health)
            );
            break targetStatement;
          }
          const targetPlayer = await findPlayerById(targetPlayerId, true, transaction);
          if (!targetPlayer) {
            await publishArenaMessage(
              arenaEngineReply.playerTryReviveButFailed(player._user!.slackId!, player.health)
            );
            break targetStatement;
          }
          await targetPlayer.reviveOrHeal(
            healthKit._healthkit?.healingPower ?? ZERO,
            MAX_PLAYER_HEALTH,
            transaction
          );
          await player.subtractHealthkit(healthKit.id, usedItemQuantity, transaction);
          await publishArenaMessage(
            arenaEngineReply.playerReviveOther(
              player._user?.slackId!,
              player.health,
              targetPlayer._user?.slackId!,
              targetPlayer.health
            )
          );
        }
        await setPlayerPerformanceAction(
          targetPlayerId!,
          round._gameId,
          {
            field: ARENA_PLAYER_PERFORMANCE.HEALED,
            value: healthKit?._healthkit?.healingPower ?? ZERO,
          },
          transaction
        );
      }
      await action.completeRoundAction(transaction);
    })
  );
}
