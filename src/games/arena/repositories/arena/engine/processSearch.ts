import type { Transaction } from 'sequelize';

import type { ArenaRound, ArenaRoundAction } from '../../../../../models';
import { setPlayerPerformanceAction } from '../../../../../models/ArenaPlayerPerformance';
import { listActiveArmorsByGameType } from '../../../../../models/ItemArmor';
import { listActiveHealthkitsByGameType } from '../../../../../models/ItemHealthKit';
import { listActiveWeaponsByGameType } from '../../../../../models/ItemWeapon';
import { GAME_TYPE, ITEM_TYPE, TRAIT } from '../../../../consts/global';
import { hasLuck } from '../../../../utils';
import {
  generateItemRarityAvailability,
  randomizeItems,
  rarityWeight,
  rollItemRarity,
} from '../../../../utils/rollRarity';
import {
  ARENA_HEALTHKITS,
  ARENA_PLAYER_PERFORMANCE,
  HEALTH_KIT_FOUND_QTY,
  SEARCH_ARMOR_SUCCESS_RATE,
  SEARCH_HEALTH_SUCCESS_RATE,
  SEARCH_WEAPONS_SUCCESS_RATE,
} from '../../../consts';
import { filterItemsByRarity, publishArenaMessage } from '../../../utils';

import { arenaEngineReply } from './replies';

export async function processSearchHealth(actions: ArenaRoundAction[], transaction: Transaction) {
  const activeHealthkits = await listActiveHealthkitsByGameType(GAME_TYPE.ARENA, transaction);
  const healthKit = activeHealthkits.find((hk) => hk.name === ARENA_HEALTHKITS.COMMON);
  await Promise.all(
    actions.map(async (action) => {
      const player = action._player!;
      if (!player.isAlive()) {
        await publishArenaMessage(arenaEngineReply.playerLostAction(player._user!.slackId!, true));
        return;
      }
      await player.setVisibility(true, transaction);
      const playerHasMaxHealthkit = player.hasMaxHealthkits();
      const searchHealthBoost =
        player.luckBoost +
        player.abilitiesJSON.searchRate +
        player.abilitiesJSON.healthkitSearchRate;
      hasLuckStatement: if (
        hasLuck(SEARCH_HEALTH_SUCCESS_RATE, searchHealthBoost) &&
        !playerHasMaxHealthkit
      ) {
        if (!healthKit) {
          await publishArenaMessage(
            arenaEngineReply.playerFoundNoHealthKit(player._user!.slackId!, player.health)
          );
          break hasLuckStatement;
        }
        await player.addHealthkit(healthKit.id, HEALTH_KIT_FOUND_QTY, transaction);
        await publishArenaMessage(
          arenaEngineReply.playerFoundHealthKit(player._user!.slackId!, player.health)
        );
      } else {
        await publishArenaMessage(
          arenaEngineReply.playerFoundNoHealthKit(player._user!.slackId!, player.health)
        );
      }
      await action.completeRoundAction(transaction);
    })
  );
}

export async function processSearchArmors(actions: ArenaRoundAction[], transaction: Transaction) {
  const activeArmors = await listActiveArmorsByGameType(GAME_TYPE.ARENA, transaction);
  await Promise.all(
    actions.map(async (action) => {
      const player = action._player!;
      await player.setVisibility(true, transaction);
      if (!player.isAlive()) {
        await publishArenaMessage(arenaEngineReply.playerLostAction(player._user!.slackId!, true));
        return;
      }
      const searchArmorBoost =
        player.luckBoost + player.abilitiesJSON.searchRate + player.abilitiesJSON.armorSearchRate;
      hasLuckStatement: if (hasLuck(SEARCH_ARMOR_SUCCESS_RATE, searchArmorBoost)) {
        const rolledRarity = rollItemRarity(ITEM_TYPE.ARMOR, {
          searchRarityAvailability: {
            Common: true,
            Rare: true,
            Epic: true,
            Legendary: true,
          },
        });
        const foundArmor = randomizeItems(filterItemsByRarity(activeArmors, rolledRarity));
        if (!foundArmor) {
          await publishArenaMessage(
            arenaEngineReply.playerFoundNoArmor(player._user!.slackId!, player.health)
          );
          break hasLuckStatement;
        }
        const currentArmor = player.itemsAvailable(player._armors).pop();
        if (currentArmor) {
          const currentArmorRarirty = rarityWeight(currentArmor._itemRarityId);
          const foundArmorRarity = rarityWeight(foundArmor._itemRarityId);

          if (foundArmorRarity >= currentArmorRarirty) {
            const currentRemainingUses = currentArmor.ArenaItemInventory.remainingUses;
            const foundRemainingUses = foundArmor.usageLimit;
            if (
              foundArmorRarity === currentArmorRarirty &&
              currentRemainingUses === foundRemainingUses
            ) {
              await publishArenaMessage(
                arenaEngineReply.playerFoundNoArmor(player._user!.slackId!, player.health)
              );
            } else {
              await player.removeArmor(currentArmor, transaction);
              await player.addArmor(foundArmor, transaction);
              await publishArenaMessage(
                arenaEngineReply.playerFoundBetterArmor(
                  player._user!.slackId!,
                  player.health,
                  foundArmor.name,
                  foundArmor.emoji,
                  rolledRarity
                )
              );
            }
          } else {
            await publishArenaMessage(
              arenaEngineReply.playerFoundNoBetterArmor(
                player._user!.slackId!,
                player.health,
                foundArmor.name,
                foundArmor.emoji,
                rolledRarity
              )
            );
          }
        } else {
          await player.addArmor(foundArmor, transaction);
          await publishArenaMessage(
            arenaEngineReply.playerFoundArmor(
              player._user!.slackId!,
              player.health,
              foundArmor.name,
              foundArmor.emoji,
              rolledRarity
            )
          );
        }
      } else {
        await publishArenaMessage(
          arenaEngineReply.playerFoundNoArmor(player._user!.slackId!, player.health)
        );
      }
      await action.completeRoundAction(transaction);
    })
  );
}

export async function processSearchWeapons(
  round: ArenaRound,
  actions: ArenaRoundAction[],
  transaction: Transaction
) {
  let mutableAvailableWeapons = await listActiveWeaponsByGameType(GAME_TYPE.ARENA, transaction);
  mutableAvailableWeapons = mutableAvailableWeapons.filter(
    (weapon) => !weapon.hasTrait(TRAIT.UNSEARCHABLE)
  );

  const weaponRarityAvailability = generateItemRarityAvailability(
    mutableAvailableWeapons,
    GAME_TYPE.ARENA
  );
  await Promise.all(
    actions.map(async (action) => {
      const player = action._player!;
      await player.setVisibility(true, transaction);
      if (!player.isAlive()) {
        await publishArenaMessage(arenaEngineReply.playerLostAction(player._user!.slackId!, true));
        return;
      }
      const searchWeaponBoost =
        player.luckBoost + player.abilitiesJSON.searchRate + player.abilitiesJSON.weaponSearchRate;
      hasLuckStatement: if (hasLuck(SEARCH_WEAPONS_SUCCESS_RATE, searchWeaponBoost)) {
        const rolledRarity = rollItemRarity(ITEM_TYPE.WEAPON, {
          searchRarityAvailability: weaponRarityAvailability,
          deltaBoost: player.luckBoost,
        });
        const foundWeapon = randomizeItems(
          filterItemsByRarity(mutableAvailableWeapons, rolledRarity)
        );
        if (!foundWeapon) {
          await publishArenaMessage(
            arenaEngineReply.playerFoundNoWeapon(player._user!.slackId!, player.health)
          );
          break hasLuckStatement;
        }
        await player.addWeapon(foundWeapon, transaction);
        await publishArenaMessage(
          arenaEngineReply.playerFoundWeapon(
            player._user!.slackId!,
            player.health,
            foundWeapon.name,
            foundWeapon.emoji,
            rolledRarity
          )
        );
        await setPlayerPerformanceAction(
          player.id,
          round._arenaGame?._gameId!,
          { field: ARENA_PLAYER_PERFORMANCE.WEAPONS_FOUND, value: 1 },
          transaction
        );
      } else {
        await publishArenaMessage(
          arenaEngineReply.playerFoundNoWeapon(player._user!.slackId!, player.health)
        );
      }
      await action.completeRoundAction(transaction);
    })
  );
}
