import { Transaction } from 'sequelize/types';
import { TowerRoundAction } from '../../../../../models';
import { findHealthkitByName } from '../../../../../models/ItemHealthKit';
import { perkImpactCalculator } from '../../../../../models/Perk';
import { ZERO } from '../../../../consts/global';
import { hasLuck } from '../../../../utils';
import {
  SEARCH_HEALTH_FOUND_QTY,
  SEARCH_HEALTH_SUCCESS_RATE,
  TOWER_HEALTHKITS,
} from '../../../consts';
import { theTowerNotifyInPrivate } from '../../../utils';
import { towerEngineReply } from './replies';

export async function processSearchHealth(
  // round: TowerRound,
  actions: TowerRoundAction[],
  transaction: Transaction
) {
  const healthKit = await findHealthkitByName(TOWER_HEALTHKITS.COMMON);
  await Promise.all(
    actions.map(async (action) => {
      const raider = action._raider!;
      await raider.setVisibility(true, transaction);
      const playerHasMaxHealthkit = raider.hasMaxHealthkits();
      const generatedAbilities = perkImpactCalculator({ raider }).toJSON();
      const searchHealthKitBoost =
        raider.luckBoost + generatedAbilities.searchRate + generatedAbilities.healthkitSearchRate;
      if (hasLuck(SEARCH_HEALTH_SUCCESS_RATE, searchHealthKitBoost) && !playerHasMaxHealthkit) {
        await raider.addHealthkit(healthKit?.id ?? ZERO, SEARCH_HEALTH_FOUND_QTY, transaction);
        await theTowerNotifyInPrivate(
          towerEngineReply.raiderFoundHealthKit(raider._user!.slackId!, raider.health),
          raider._user!.slackId!
        );
      } else {
        await theTowerNotifyInPrivate(
          towerEngineReply.raiderFoundNoHealthKit(raider._user!.slackId!, raider.health),
          raider._user!.slackId!
        );
      }
      await action.completeRoundAction(transaction);
    })
  );
}
