import { Transaction } from 'sequelize/types';
import { TowerRound, TowerRoundAction } from '../../../../../models';
import { listActiveArmorsByGameType } from '../../../../../models/ItemArmor';
import { findHealthkitByName } from '../../../../../models/ItemHealthKit';
import { listActiveWeaponsByGameType } from '../../../../../models/ItemWeapon';
import { perkImpactCalculator } from '../../../../../models/Perk';
import { findTowerFloorById } from '../../../../../models/TowerFloor';
import { addAmmoToItemInInventory } from '../../../../../models/TowerItemInventory';
import { SEARCH_WEAPONS_SUCCESS_RATE } from '../../../../arena/consts';
import { filterItemsByRarity } from '../../../../arena/utils';
import { GAME_TYPE, ITEM_TYPE, TRAIT, ZERO } from '../../../../consts/global';
import { hasLuck } from '../../../../utils';
import { randomizeItems, rarityWeight, rollItemRarity } from '../../../../utils/rollRarity';
import {
  SEARCH_ARMOR_SUCCESS_RATE,
  SEARCH_HEALTH_FOUND_QTY,
  SEARCH_HEALTH_SUCCESS_RATE,
  TOWER_HEALTHKITS,
} from '../../../consts';
import { defineSearchRarityParamsByFloor, theTowerNotifyInPrivate } from '../../../utils';
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
      hasLuckStatement: if (
        hasLuck(SEARCH_HEALTH_SUCCESS_RATE, searchHealthKitBoost) &&
        !playerHasMaxHealthkit
      ) {
        if (!healthKit) {
          await theTowerNotifyInPrivate(
            towerEngineReply.raiderFoundNoHealthKit(raider._user!.slackId!, raider.health),
            raider._user!.slackId!
          );
          break hasLuckStatement;
        }
        await raider.addHealthkit(healthKit.id, SEARCH_HEALTH_FOUND_QTY, transaction);
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

export async function processSearchArmors(
  round: TowerRound,
  actions: TowerRoundAction[],
  transaction: Transaction
) {
  const towerFloor = (await findTowerFloorById(
    round._floorBattlefield?._towerFloorId!,
    true,
    transaction
  ))!;
  const activeArmors = await listActiveArmorsByGameType(GAME_TYPE.TOWER, transaction);
  const armorRarityParams = defineSearchRarityParamsByFloor(towerFloor.number);
  await Promise.all(
    actions.map(async (action) => {
      const raider = action._raider!;
      await raider.setVisibility(true, transaction);
      const generatedAbilities = perkImpactCalculator({ raider }).toJSON();
      const searchArmorBoost =
        raider.luckBoost + generatedAbilities.searchRate + generatedAbilities.armorSearchRate;
      hasLuckStatement: if (hasLuck(SEARCH_ARMOR_SUCCESS_RATE, searchArmorBoost)) {
        armorRarityParams.deltaBoost = raider.luckBoost + generatedAbilities.rarityRateBonus;
        const rolledRarity = rollItemRarity(ITEM_TYPE.ARMOR, armorRarityParams);
        const foundArmor = randomizeItems(filterItemsByRarity(activeArmors, rolledRarity));
        if (!foundArmor) {
          await theTowerNotifyInPrivate(
            towerEngineReply.raiderFoundNoArmor(raider._user!.slackId!, raider.health),
            raider._user!.slackId!
          );
          break hasLuckStatement;
        }
        const currentArmor = raider.itemsAvailable(raider._armors)[ZERO];
        if (currentArmor) {
          const currentArmorRarity = rarityWeight(currentArmor._itemRarityId);
          const foundArmorRarity = rarityWeight(foundArmor._itemRarityId);

          if (foundArmorRarity >= currentArmorRarity) {
            const currentRemainingUses = currentArmor.TowerItemInventory?.remainingUses;
            const foundRemainingUses = foundArmor.usageLimit;
            if (
              foundArmorRarity === currentArmorRarity &&
              currentRemainingUses === foundRemainingUses
            ) {
              await theTowerNotifyInPrivate(
                towerEngineReply.raiderFoundNoArmor(raider._user!.slackId!, raider.health),
                raider._user!.slackId!
              );
            } else {
              await raider.removeArmor(currentArmor, transaction);
              await raider.addArmor(foundArmor, transaction);
              await theTowerNotifyInPrivate(
                towerEngineReply.raiderFoundBetterArmor(
                  raider._user!.slackId!,
                  raider.health,
                  foundArmor.name,
                  foundArmor.emoji,
                  rolledRarity
                ),
                raider._user!.slackId!
              );
            }
          } else {
            await theTowerNotifyInPrivate(
              towerEngineReply.raiderFoundNoBetterArmor(
                raider._user!.slackId!,
                raider.health,
                foundArmor.name,
                foundArmor.emoji,
                rolledRarity
              ),
              raider._user!.slackId!
            );
          }
        } else {
          await raider.addArmor(foundArmor, transaction);
          await theTowerNotifyInPrivate(
            towerEngineReply.raiderFoundArmor(
              raider._user!.slackId!,
              raider.health,
              foundArmor.name,
              foundArmor.emoji,
              rolledRarity
            ),
            raider._user!.slackId!
          );
        }
      } else {
        await theTowerNotifyInPrivate(
          towerEngineReply.raiderFoundNoArmor(raider._user!.slackId!, raider.health),
          raider._user!.slackId!
        );
      }
      await action.completeRoundAction(transaction);
    })
  );
}

export async function processSearchWeapons(
  round: TowerRound,
  actions: TowerRoundAction[],
  transaction: Transaction
) {
  let mutableAvailableWeapons = await listActiveWeaponsByGameType(GAME_TYPE.TOWER, transaction);
  mutableAvailableWeapons = mutableAvailableWeapons.filter(
    (weapon) => !weapon.hasTrait(TRAIT.UNSEARCHABLE) && !weapon.hasTrait(TRAIT.INITIAL)
  );
  const towerFloor = (await findTowerFloorById(
    round._floorBattlefield?._towerFloorId!,
    true,
    transaction
  ))!;
  const weaponRarityParams = defineSearchRarityParamsByFloor(towerFloor.number);
  await Promise.all(
    actions.map(async (action) => {
      const raider = action._raider!;
      await raider.setVisibility(true, transaction);
      const generatedAbilities = perkImpactCalculator({ raider }).toJSON();
      const searchWeaponBoost =
        raider.luckBoost + generatedAbilities.searchRate + generatedAbilities.weaponSearchRate;
      hasLuckStatement: if (hasLuck(SEARCH_WEAPONS_SUCCESS_RATE, searchWeaponBoost)) {
        weaponRarityParams.deltaBoost = raider.luckBoost + generatedAbilities.rarityRateBonus;
        const rolledRarity = rollItemRarity(ITEM_TYPE.WEAPON, weaponRarityParams);
        const foundWeapon = randomizeItems(
          filterItemsByRarity(mutableAvailableWeapons, rolledRarity)
        );
        if (!foundWeapon) {
          await theTowerNotifyInPrivate(
            towerEngineReply.raiderFoundNoWeapon(raider._user!.slackId!, raider.health),
            raider._user!.slackId!
          );
          break hasLuckStatement;
        }
        const raiderWeapon = raider._weapons?.find((w) => w.id === foundWeapon.id);
        if (raiderWeapon?.TowerItemInventory.remainingUses != null) {
          await addAmmoToItemInInventory({ item: raiderWeapon, raider }, transaction);
        } else {
          if (!raiderWeapon) {
            await raider.addWeapon(foundWeapon, transaction);
          }
        }
        await theTowerNotifyInPrivate(
          towerEngineReply.raiderFoundWeapon(
            raider._user!.slackId!,
            raider.health,
            foundWeapon.name,
            foundWeapon.emoji,
            rolledRarity
          ),
          raider._user!.slackId!
        );
      } else {
        await theTowerNotifyInPrivate(
          towerEngineReply.raiderFoundNoWeapon(raider._user!.slackId!, raider.health),
          raider._user!.slackId!
        );
      }
      await action.completeRoundAction(transaction);
    })
  );
}
