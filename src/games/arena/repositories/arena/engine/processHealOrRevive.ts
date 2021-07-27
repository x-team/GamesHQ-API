import { Transaction } from 'sequelize/types';
import { ArenaRound, ArenaRoundAction } from '../../../../../models';
import { findPlayerById } from '../../../../../models/ArenaPlayer';
import { setPlayerPerformanceAction } from '../../../../../models/ArenaPlayerPerformance';
import { findHealthkitByName } from '../../../../../models/ItemHealthKit';
import { ITEM_TYPE, ZERO } from '../../../../consts/global';
import { ARENA_PLAYER_PERFORMANCE, MAX_PLAYER_HEALTH } from '../../../consts';
import { publishArenaMessage } from '../../../utils';
import { gameEngineReply } from './replies';

export async function processHealOrRevive(
  round: ArenaRound,
  actions: ArenaRoundAction[],
  transaction: Transaction
) {
  const healthKit = await findHealthkitByName(ITEM_TYPE.HEALTH_KIT, transaction);
  await Promise.all(
    actions.map(async (action) => {
      const player = action._player!;
      if (round.isEveryoneVisible) {
        await player.setVisibility(true, transaction);
      }
      const healthKitQty = await player.healthkitQty(healthKit?.id ?? ZERO);
      healthKitQtyStatement: if (healthKitQty > 0) {
        if (!healthKit) {
          await publishArenaMessage(
            gameEngineReply.playerFoundNoHealthKit(player._user!.slackId!, player.health)
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
            gameEngineReply.playerSelfRevive(player._user!.slackId!, action._player!.health)
          );
        } else {
          if (!targetPlayerId) {
            await publishArenaMessage(
              gameEngineReply.playerFoundNoHealthKit(player._user!.slackId!, player.health)
            );
            break targetStatement;
          }
          const targetPlayer = await findPlayerById(targetPlayerId, true, transaction);
          if (!targetPlayer) {
            await publishArenaMessage(
              gameEngineReply.playerFoundNoHealthKit(player._user!.slackId!, player.health)
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
            gameEngineReply.playerReviveOther(
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
