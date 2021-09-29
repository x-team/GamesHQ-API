import type { Transaction } from 'sequelize';
import { ArenaRoundAction } from '../../../../../models';
import { ARENA_ACTIONS, RING_SYSTEM_BASE_DAMAGE } from '../../../consts';
import { publishArenaMessage } from '../../../utils';
import { arenaEngineReply } from './replies';

export async function processRingSystemPenalty(
  inactiveZonePenaltyPower: number,
  actions: ArenaRoundAction[],
  transaction: Transaction
) {
  const penaltyDamage = Math.pow(RING_SYSTEM_BASE_DAMAGE, inactiveZonePenaltyPower);
  for (const action of actions) {
    const targetPlayer = action._player!;
    if (!targetPlayer.isAlive()) {
      continue;
    }
    await targetPlayer.damageAndHide(
      penaltyDamage,
      true, // Players won't hide with the penalty damage
      transaction
    );
    await targetPlayer.reloadFullInventory(transaction);
    const dealtDamageMessage = arenaEngineReply.zonePenaltyDamageDealt({
      damage: penaltyDamage,
      targetHealth: targetPlayer.health,
      targetSlackId: targetPlayer._user?.slackId!,
    });
    await publishArenaMessage(dealtDamageMessage);
    if (action._availableActionId === ARENA_ACTIONS.STAY_ON_LOCATION) {
      await action.completeRoundAction(transaction);
    }
  }
}
