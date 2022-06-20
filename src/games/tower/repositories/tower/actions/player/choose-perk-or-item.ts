import type { User } from '../../../../../../models';
import { findArmorById } from '../../../../../../models/ItemArmor';
import { findHealthkitById } from '../../../../../../models/ItemHealthKit';
import { findWeaponById } from '../../../../../../models/ItemWeapon';
import { findPerkById } from '../../../../../../models/Perk';
import { addAmmoToItemInInventory } from '../../../../../../models/TowerItemInventory';
import { ZERO } from '../../../../../consts/global';
import type { GameResponse } from '../../../../../utils';
import { getGameResponse } from '../../../../../utils';
import { rarityWeight } from '../../../../../utils/rollRarity';
import { MAX_RAIDER_HEALTH, TOWER_HEALTHKITS } from '../../../../consts';
import { generateTowerActionsBlockKit } from '../../../../generators/gameplay';
import type { TowerRaiderInteraction } from '../../../../utils';
import { raiderActionsAlive, withTowerTransaction } from '../../../../utils';
import { towerCommandReply } from '../../replies';

export async function completeChoosePerkOrItem(
  userRequesting: User,
  perkOrHealthkitId: string | number,
  selection: string
) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider } = raiderActions as TowerRaiderInteraction;

    let mutableMessageToDisplay = '';
    const hud = towerCommandReply.raiderHUD(raider);
    switch (selection) {
      case 'perk':
        const perkFound = await findPerkById(perkOrHealthkitId as string, transaction);
        if (!perkFound) {
          const actionBlockkit = generateTowerActionsBlockKit(
            hud,
            towerCommandReply.perkNotFound()
          );
          return getGameResponse(actionBlockkit);
        }
        await raider.addPerk(perkFound, transaction);
        await raider.reloadFullInventory(transaction);
        mutableMessageToDisplay = towerCommandReply.perkImplemented(perkFound);
        break;
      case 'healthkit':
        const healthkitFound = await findHealthkitById(perkOrHealthkitId as number, transaction);
        if (!healthkitFound) {
          const actionBlockkit = generateTowerActionsBlockKit(
            hud,
            towerCommandReply.itemNotFound(selection)
          );
          return getGameResponse(actionBlockkit);
        }
        if (healthkitFound.name === TOWER_HEALTHKITS.COMMON) {
          if (raider.health < MAX_RAIDER_HEALTH) {
            await raider.reviveOrHeal(
              healthkitFound._healthkit?.healingPower || ZERO,
              MAX_RAIDER_HEALTH,
              transaction
            );
          } else {
            const qnty = 1;
            await raider.addHealthkit(healthkitFound.id, qnty, transaction);
          }
        }
        mutableMessageToDisplay = towerCommandReply.itemAddedOrApplied(healthkitFound, selection);
        break;
      case 'weapon':
        const weaponFound = await findWeaponById(perkOrHealthkitId as number, transaction);
        if (!weaponFound) {
          const actionBlockkit = generateTowerActionsBlockKit(
            hud,
            towerCommandReply.itemNotFound(selection)
          );
          return getGameResponse(actionBlockkit);
        }
        const raiderWeapon = raider._weapons?.find((w) => w.id === weaponFound.id);
        if (raiderWeapon?.TowerItemInventory.remainingUses != null) {
          await addAmmoToItemInInventory({ item: raiderWeapon, raider }, transaction);
        } else if (!raiderWeapon) {
          await raider.addWeapon(weaponFound, transaction);
        }
        mutableMessageToDisplay = towerCommandReply.itemAddedOrApplied(weaponFound, selection);
        break;
      case 'armor':
        const armorFound = await findArmorById(perkOrHealthkitId as number, transaction);
        if (!armorFound) {
          const actionBlockkit = generateTowerActionsBlockKit(
            hud,
            towerCommandReply.itemNotFound(selection)
          );
          return getGameResponse(actionBlockkit);
        }
        const currentArmor = raider.itemsAvailable(raider._armors)[ZERO];
        if (currentArmor) {
          const armorToAddRarity = rarityWeight(armorFound._itemRarityId);
          const currentArmorRarity = rarityWeight(currentArmor._itemRarityId);
          if (armorToAddRarity >= currentArmorRarity) {
            await raider.removeArmor(currentArmor, transaction);
            await raider.addArmor(armorFound, transaction);
          }
        } else {
          await raider.addArmor(armorFound, transaction);
        }
        mutableMessageToDisplay = towerCommandReply.itemAddedOrApplied(armorFound, selection);
        break;
    }
    const actionBlockkit = generateTowerActionsBlockKit(hud, mutableMessageToDisplay);
    return getGameResponse(actionBlockkit);
  });
}
