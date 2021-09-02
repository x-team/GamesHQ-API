import { Transaction } from 'sequelize/types';
import { TowerRound, TowerRoundAction } from '../../../../../models';
import { findHealthkitByName } from '../../../../../models/ItemHealthKit';
import { perkImpactCalculator } from '../../../../../models/Perk';
import { findRaiderById } from '../../../../../models/TowerRaider';
import { ZERO } from '../../../../consts/global';
import { MAX_RAIDER_HEALTH, TOWER_HEALTHKITS } from '../../../consts';
import { theTowerNotifyInPrivate } from '../../../utils';
import { towerEngineReply } from './replies';

export async function processHealOrRevive(
  round: TowerRound,
  actions: TowerRoundAction[],
  transaction: Transaction
) {
  const healthKit = await findHealthkitByName(TOWER_HEALTHKITS.COMMON);
  await Promise.all(
    actions.map(async (action) => {
      const raider = action._raider!;
      if (round.isEveryoneVisible) {
        await raider.setVisibility(true, transaction);
      }
      const healthKitQty = await raider.healthkitQty(healthKit?.id ?? ZERO);
      healthKitQtyStatement: if (healthKitQty > ZERO) {
        if (!healthKit) {
          await theTowerNotifyInPrivate(
            towerEngineReply.playerTryReviveButFailed(raider._user!.slackId!, raider.health),
            raider._user!.slackId!
          );
          break healthKitQtyStatement;
        }
        const usedItemQuantity = 1;
        const { targetRaiderId } = action.actionJSON;
        targetStatement: if (targetRaiderId === raider.id) {
          const generatedAbilities = perkImpactCalculator({ raider }).toJSON();
          await raider.reviveOrHeal(
            (healthKit._healthkit?.healingPower ?? ZERO) + generatedAbilities.flatHealingBoost,
            MAX_RAIDER_HEALTH,
            transaction
          );
          await raider.subtractHealthkit(healthKit.id, usedItemQuantity, transaction);
          await theTowerNotifyInPrivate(
            towerEngineReply.raiderSelfRevive(raider._user!.slackId!, raider.health),
            raider._user!.slackId!
          );
        } else {
          if (!targetRaiderId) {
            await theTowerNotifyInPrivate(
              towerEngineReply.playerTryReviveButFailed(raider._user!.slackId!, raider.health),
              raider._user!.slackId!
            );
            break targetStatement;
          }
          const targetRaider = await findRaiderById(targetRaiderId ?? ZERO, true, transaction);
          if (!targetRaider) {
            await theTowerNotifyInPrivate(
              towerEngineReply.playerTryReviveButFailed(raider._user!.slackId!, raider.health),
              raider._user!.slackId!
            );
            break targetStatement;
          }
          const generatedAbilities = perkImpactCalculator({ raider: targetRaider }).toJSON();
          await targetRaider.reviveOrHeal(
            (healthKit?._healthkit?.healingPower ?? ZERO) + generatedAbilities.flatHealingBoost,
            MAX_RAIDER_HEALTH,
            transaction
          );
          await raider.subtractHealthkit(healthKit.id, usedItemQuantity, transaction);
          await theTowerNotifyInPrivate(
            towerEngineReply.raiderReviveOther(
              raider._user!.slackId!,
              raider.health,
              targetRaider._user!.slackId!,
              targetRaider.health
            ),
            raider._user!.slackId!
          );
        }
      }
      await action.completeRoundAction(transaction);
    })
  );
}
