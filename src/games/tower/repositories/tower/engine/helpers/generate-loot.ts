import { random } from 'lodash';
import { Transaction } from 'sequelize/types';
import { Item, TowerFloor, TowerRaider } from '../../../../../../models';
import { listActiveArmorsByGameType } from '../../../../../../models/ItemArmor';
import { listActiveHealthkitsByGameType } from '../../../../../../models/ItemHealthKit';
import { listActiveWeaponsByGameType } from '../../../../../../models/ItemWeapon';
import { addAmmoToItemInInventory } from '../../../../../../models/TowerItemInventory';
import { MAX_AMOUNT_HEALTHKITS_ALLOWED } from '../../../../../arena/consts';
import { filterItemsByRarity } from '../../../../../arena/utils';
import { GAME_TYPE, ITEM_RARITY, ONE, TRAIT, ZERO } from '../../../../../consts/global';
import { hasLuck } from '../../../../../utils';
import { randomizeItems, rarityWeight } from '../../../../../utils/rollRarity';
import { MAX_RAIDER_HEALTH, TOWER_LOOT_PRIZES } from '../../../../consts';
import { rollLootPrize } from '../../../../utils';

export async function generateLoot(
  towerFloor: TowerFloor,
  raider: TowerRaider,
  transaction: Transaction
) {
  const floorNumber = towerFloor.number;
  let mutableRarityArray: Array<ITEM_RARITY>;
  const FIRST_COHORT = 3;
  const SECOND_COHORT = 7;
  const SMALL_LOOT = 1;
  const LARGE_LOOT = 2;

  if (floorNumber <= FIRST_COHORT) {
    mutableRarityArray = [ITEM_RARITY.COMMON, ITEM_RARITY.RARE];
  } else if (floorNumber <= SECOND_COHORT) {
    mutableRarityArray = [ITEM_RARITY.RARE, ITEM_RARITY.EPIC];
  } else {
    mutableRarityArray = [ITEM_RARITY.EPIC, ITEM_RARITY.LEGENDARY];
  }
  const HUNDRED_PERCENT = 1;
  const towerHeight = towerFloor._towerGame?.height!;
  const chanceIncreaseRate = HUNDRED_PERCENT / towerHeight;
  const largeLootChance = floorNumber * chanceIncreaseRate;
  const willGetLargeLootSize = hasLuck(largeLootChance);
  const lootSize = !willGetLargeLootSize ? SMALL_LOOT : LARGE_LOOT;

  const activeArmors = await listActiveArmorsByGameType(GAME_TYPE.TOWER, transaction);
  const activeWeapons = await listActiveWeaponsByGameType(GAME_TYPE.TOWER, transaction);
  const activeHealthKits = await listActiveHealthkitsByGameType(GAME_TYPE.TOWER, transaction);
  const loot: Item[] = new Array(lootSize);
  for (let mutableI = 0; mutableI < loot.length; mutableI++) {
    // Update raider's inventory
    await raider.reloadFullInventory();
    const raiderCanWinHealthkits = raider._healthkits?.find(
      (healthkit) =>
        (healthkit?.TowerItemInventory?.remainingUses || MAX_AMOUNT_HEALTHKITS_ALLOWED) <
        MAX_AMOUNT_HEALTHKITS_ALLOWED
    );
    const availableItemPrizes: TOWER_LOOT_PRIZES[] = [
      TOWER_LOOT_PRIZES.WEAPON,
      TOWER_LOOT_PRIZES.ARMOR,
    ];
    if (raiderCanWinHealthkits) {
      availableItemPrizes.push(TOWER_LOOT_PRIZES.HEALTH_KIT);
    }
    const lootElement = rollLootPrize(availableItemPrizes);
    const rolledRarity = mutableRarityArray[random(mutableRarityArray.length - ONE)];

    switch (lootElement) {
      case TOWER_LOOT_PRIZES.HEALTH_KIT:
        const healthkitsFiltered = filterItemsByRarity(activeHealthKits, rolledRarity);
        const healthkitRolled = randomizeItems(healthkitsFiltered);
        // if (itemToAdd?.name === TOWER_ITEMS.HEALTH_KIT) {
        if (raider.health < MAX_RAIDER_HEALTH) {
          await raider.reviveOrHeal(
            healthkitRolled._healthkit?.healingPower ?? ZERO,
            MAX_RAIDER_HEALTH,
            transaction
          );
        } else {
          await raider.addHealthkit(healthkitRolled.id, ONE, transaction);
        }
        /*} else if (itemToAdd?.name === TOWER_ITEMS.LUCK_ELIXIR) {
          await boostLuck(raider, transaction);
        }*/
        loot[mutableI] = healthkitRolled;
        break;
      case TOWER_LOOT_PRIZES.ARMOR:
        const armorsFiltered = filterItemsByRarity(activeArmors, rolledRarity);
        const armorToAdd = randomizeItems(armorsFiltered);

        const currentArmor = raider.itemsAvailable(raider._armors)[ZERO];
        if (currentArmor) {
          const currentArmorRarity = rarityWeight(currentArmor._itemRarityId);
          const armorToAddRarity = rarityWeight(armorToAdd._itemRarityId);
          if (armorToAddRarity >= currentArmorRarity) {
            await raider.removeArmor(currentArmor, transaction);
            await raider.addArmor(armorToAdd, transaction);
          }
        } else {
          await raider.addArmor(armorToAdd, transaction);
        }
        loot[mutableI] = armorToAdd;
        break;
      case TOWER_LOOT_PRIZES.WEAPON:
        const weaponsFiltered = filterItemsByRarity(
          activeWeapons.filter((w) => !w.hasTrait(TRAIT.INITIAL)),
          rolledRarity
        );
        const weaponToAdd = randomizeItems(weaponsFiltered);
        const raiderWeapon = raider._weapons?.find((w) => w.id === weaponToAdd.id);
        if (raiderWeapon?.TowerItemInventory?.remainingUses != null) {
          await addAmmoToItemInInventory({ item: raiderWeapon, raider }, transaction);
        } else if (!raiderWeapon) {
          await raider.addWeapon(weaponToAdd, transaction);
        }
        loot[mutableI] = weaponToAdd;
        break;
      default:
        break;
    }
  }
  return loot;
}
