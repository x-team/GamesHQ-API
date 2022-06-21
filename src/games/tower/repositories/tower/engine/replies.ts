import { isNil } from 'lodash';

import type { ArenaPlayer, Enemy, TowerFloorBattlefieldEnemy } from '../../../../../models';
import { playerAndHealthDisplay } from '../../../../arena/repositories/arena/engine/replies';
import {
  ARMOR_INVENTORY_EMOJI,
  CHARGING_ACTION,
  FULL_HEALTH_HEART_EMOJI,
  PERK_IMPLEMENTATION_EMOJI,
  PLAYER_HIDE_EMOJI,
  PLAYER_VISIBLE_EMOJI,
  SCREAM_EMOJI,
  SPINNER_EMOJI,
  WEAPON_INVENTORY_EMOJI,
} from '../../../../consts/emojis';
import type { DamageDealtSpecs, ITEM_RARITY } from '../../../../consts/global';
import {
  basicHealthDisplayInParentheses,
  generateRarityColorEmoji,
  generateSoldierAnimationEmoji,
  randomSkinColor,
} from '../../../../helpers';
import { luckBoostRateToPercentageString } from '../../../utils';

export const towerEngineReply = {
  // WEAPONS
  weaponBlastDamage: () => `*${generateSoldierAnimationEmoji()}* :boom: *BLAST DAMAGE!* :boom:`,
  weaponAreaDamage: () => `:booom: AREA DAMAGE :booom:`,

  // RAIDER
  raiderFoundHealthKit: (slackId: string, health: number) =>
    `:medkit: <@${slackId}> ${basicHealthDisplayInParentheses(
      health
    )} searched for a health kit and *found one*!`,

  raiderFoundNoHealthKit: (slackId: string, health: number) =>
    `:medkit: <@${slackId}> searched for a health kit and *found... nothing* :grimacing:\n` +
    `${playerAndHealthDisplay([{ slackId, health }])}`,

  playerTryReviveButFailed: (targetSlackId: string, health: number) =>
    `${FULL_HEALTH_HEART_EMOJI} <@${targetSlackId}> *tried* to use a health kit` +
    `but failed ${SCREAM_EMOJI}\n` +
    `${playerAndHealthDisplay([{ slackId: targetSlackId, health }])}`,

  raiderSelfRevive: (slackId: string, health: number) =>
    `${FULL_HEALTH_HEART_EMOJI} <@${slackId}> used a health kit.\n` +
    `${playerAndHealthDisplay([{ slackId, health }])}`,

  raiderReviveOther: (
    playerSlackId: string,
    playerHealth: number,
    targetSlackId: string,
    targetHealth: number
  ) =>
    `${FULL_HEALTH_HEART_EMOJI} <@${playerSlackId}> ${basicHealthDisplayInParentheses(
      playerHealth
    )} ` +
    `used a health kit on <@${targetSlackId}>.\n` +
    `<@${targetSlackId}> now has ${basicHealthDisplayInParentheses(targetHealth)}`,

  raiderSelfDrinkLuckElixir: (slackId: string) =>
    `:edlixir: <@${slackId}> used an Edlixir.\n` + `+${luckBoostRateToPercentageString()}`,

  raiderGaveLuckElixirToOther: (
    playerSlackId: string,
    playerHealth: number,
    targetSlackId: string
  ) =>
    `:edlixir: <@${playerSlackId}> ${basicHealthDisplayInParentheses(playerHealth)} ` +
    `used an Edlixir on <@${targetSlackId}>.\n` +
    `<@${targetSlackId}> +${luckBoostRateToPercentageString()}`,

  raiderFoundWeapon: (
    slackId: string,
    health: number,
    weaponName: string,
    weaponEmoji: string,
    rarity: ITEM_RARITY
  ) =>
    `${WEAPON_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for a weapon and *found one*! ${weaponName}${generateRarityColorEmoji(
      rarity
    )}${weaponEmoji}!`,

  raiderFoundArmor: (
    slackId: string,
    health: number,
    armorName: string,
    armorEmoji: string,
    rarity: ITEM_RARITY
  ) =>
    `${ARMOR_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for an armor and *found one*! ${armorName}${generateRarityColorEmoji(
      rarity
    )}${armorEmoji}!`,

  raiderFoundBetterArmor: (
    slackId: string,
    health: number,
    armorName: string,
    armorEmoji: string,
    rarity: ITEM_RARITY
  ) =>
    `${ARMOR_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for a _new_ armor and *found a better one*! ${armorName}${generateRarityColorEmoji(
      rarity
    )}${armorEmoji}!`,

  enemyArmorbreakOnPlayerMessage: (enemy: Enemy, slackId: string, armorEmoji: string) =>
    `${enemy.emoji} ${enemy.name} broke <@${slackId}>'s ${armorEmoji} armor with its *Armor Break* trait!`,

  playerArmorbreakOnEnemy: (enemy: Enemy, slackId: string) =>
    `<@${slackId}> broke ${enemy.emoji} ${enemy.name}'s armor with their *Armor Break* trait!`,

  raiderFoundNoBetterArmor: (
    slackId: string,
    health: number,
    armorName: string,
    armorEmoji: string,
    rarity: string
  ) =>
    `${ARMOR_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for a _new_ armor and *and didn't find something better*! ${armorName} ${armorEmoji} (${rarity})!`,

  raiderFoundNoWeapon: (slackId: string, health: number) =>
    `${WEAPON_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for a weapon and *found... nothing*! :grimacing:`,

  raiderFoundNoArmor: (slackId: string, health: number) =>
    `${ARMOR_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for an armor and *found... nothing*! :grimacing:`,

  raiderWillHide: (slackId: string, health: number) =>
    `${PLAYER_HIDE_EMOJI} <@${slackId}> found a place to hide.\n` +
    `${playerAndHealthDisplay([{ slackId, health }])}`,

  raiderFailedToHitEnemy: (
    playerSlackId: string,
    playerHealth: number,
    weaponEmoji: string,
    enemy: TowerFloorBattlefieldEnemy
  ) =>
    `:facepalm: <@${playerSlackId}> ${basicHealthDisplayInParentheses(playerHealth)} ` +
    `${weaponEmoji} _*missed*_ ${enemy._towerFloorEnemy?._enemy?.name} ` +
    `${enemy._towerFloorEnemy?._enemy?.emoji}` +
    `${basicHealthDisplayInParentheses(enemy.health)}`,

  raiderDealtDamageToEnemy: (
    playerSlackId: string,
    playerHealth: number,
    damageDetails: DamageDealtSpecs,
    weaponEmoji: string,
    enemy: TowerFloorBattlefieldEnemy,
    isEveryoneVisible: boolean,
    isFinalHitInCombo: boolean,
    isPiercingDamage: boolean
  ) => {
    const damageText =
      `${enemy.health ? generateSoldierAnimationEmoji() : ':skull:'} ` +
      `<@${playerSlackId}> ${basicHealthDisplayInParentheses(playerHealth)} ` +
      `${weaponEmoji} hit ${enemy._towerFloorEnemy?._enemy?.emoji} ${enemy._towerFloorEnemy?._enemy?.name} ` +
      `for${
        !isNil(damageDetails.newDamage) ? ` ~*${damageDetails.originalDamage} damage!*~` : ''
      }` +
      `${damageDetails.armorSpecs ? ` ${damageDetails.armorSpecs.emoji}` : ''}` +
      `${damageDetails.wasOriginatedByPerk ? ` ${PERK_IMPLEMENTATION_EMOJI}` : ''}` +
      ` *${damageDetails.newDamage ?? damageDetails.originalDamage} damage!* ${
        isPiercingDamage ? '(_Piercing Damage_)' : ''
      }\n`;

    const consequenceText =
      `${
        isEveryoneVisible && enemy.health
          ? `${enemy._towerFloorEnemy?._enemy?.emoji}:dash: `
          : enemy.health
          ? `${PLAYER_HIDE_EMOJI} `
          : ':rip: '
      } ` +
      `${enemy._towerFloorEnemy?._enemy?.name} ` +
      `${
        enemy.health
          ? `*is hiding* and now has ${basicHealthDisplayInParentheses(enemy.health)}`
          : 'is now dead'
      }`;

    if (isFinalHitInCombo || !enemy.isAlive()) {
      return damageText + consequenceText;
    }
    return damageText;
  },

  raiderHasNobodyToHunt: (slackId: string, weaponEmoji: string) =>
    `${generateSoldierAnimationEmoji()} <@${slackId}> went hunting ${weaponEmoji}\n` +
    ` and *found no one* out in the open.`,

  raiderLostAction: (slackId: string) =>
    `:face_with_head_bandage: <@${slackId}> lost actions due to damage.\n`,

  raiderCheerSomebody: (player: ArenaPlayer, targetPlayerSlackId: string) =>
    `${
      player.health <= 0 ? ':rip:' : player.isVisible ? PLAYER_VISIBLE_EMOJI : PLAYER_HIDE_EMOJI
    } ` +
    `<@${player._user?.slackId}> :tada: ` +
    `is cheering on <@${targetPlayerSlackId}>! :claps: :claps: :claps:`,

  // ENEMY
  enemyDealtDamage: (
    enemy: TowerFloorBattlefieldEnemy,
    damageDetails: DamageDealtSpecs,
    targetSlackId: string,
    targetHealth: number,
    isEveryoneVisible: boolean,
    isFinalHitInCombo: boolean,
    isPiercingAttack: boolean
  ) => {
    const damageText =
      `${enemy._towerFloorEnemy?._enemy?.emoji} ${enemy._towerFloorEnemy?._enemy?.name} ` +
      `${basicHealthDisplayInParentheses(enemy.health)} ` +
      `hit <@${targetSlackId}> ` +
      `for${
        !isNil(damageDetails.newDamage) ? ` ~*${damageDetails.originalDamage} damage!*~` : ''
      }` +
      `${damageDetails.armorSpecs ? ` ${damageDetails.armorSpecs.emoji}` : ''}` +
      `${damageDetails.wasOriginatedByPerk ? ` ${PERK_IMPLEMENTATION_EMOJI}` : ''}` +
      ` *${damageDetails.newDamage ?? damageDetails.originalDamage} damage!* ${
        isPiercingAttack ? '(_Piercing Damage_)' : ''
      }\n`;

    const consequenceText =
      `${
        isEveryoneVisible && targetHealth
          ? `:running:${randomSkinColor()}:dash:`
          : targetHealth
          ? PLAYER_HIDE_EMOJI
          : ':rip:'
      } ` +
      `<@${targetSlackId}> ${
        targetHealth
          ? `*is hiding* and now has ${basicHealthDisplayInParentheses(targetHealth)}`
          : 'is now dead'
      }`;

    if (isFinalHitInCombo) {
      return damageText + consequenceText;
    }
    return damageText;
  },

  enemyFailedToHit: (
    enemy: TowerFloorBattlefieldEnemy,
    targetSlackId: string,
    targetHealth: number
  ) =>
    `:facepalm: ${enemy._towerFloorEnemy?._enemy?.name} ` +
    `${enemy._towerFloorEnemy?._enemy?.emoji} _*missed*_ <@${targetSlackId}>\n` +
    `:woman-running:${randomSkinColor()}:dash: ` +
    `${playerAndHealthDisplay([{ slackId: targetSlackId, health: targetHealth }])}`,

  enemyHasNobodyToHunt: (enemy: TowerFloorBattlefieldEnemy) =>
    `${enemy._towerFloorEnemy?._enemy?.emoji} ${enemy._towerFloorEnemy?._enemy?.name} went hunting\n` +
    ` and *found no one* out in the open.`,

  enemyLostAction: (enemyName: string) =>
    `:face_with_head_bandage: ${enemyName} lost actions due to damage.\n`,

  enemyWillHide: (enemy: TowerFloorBattlefieldEnemy) =>
    `${PLAYER_HIDE_EMOJI} *${enemy._towerFloorEnemy?._enemy?.name}* ${enemy._towerFloorEnemy?._enemy?.emoji} found a place to hide. ` +
    `${basicHealthDisplayInParentheses(enemy.health)}`,

  enemyWillCharge: (enemy: TowerFloorBattlefieldEnemy) =>
    `${CHARGING_ACTION} *${enemy._towerFloorEnemy?._enemy?.name}* ${enemy._towerFloorEnemy?._enemy?.emoji} started to charge their attack. ${SPINNER_EMOJI} ` +
    `${basicHealthDisplayInParentheses(enemy.health)}`,
};
