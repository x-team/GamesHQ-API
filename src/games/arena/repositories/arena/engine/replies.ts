import { ArenaPlayer, ArenaZone } from '../../../../../models';
import {
  ARMOR_INVENTORY_EMOJI,
  BOSS_EMOJI,
  BOSS_WEAPON_EMOJI,
  FULL_HEALTH_HEART_EMOJI,
  HEALTH_KIT_EMOJI,
  LOOT_CRATE_EMOJI,
  NO_ENTRY_SIGN,
  PERK_IMPLEMENTATION_EMOJI,
  PLAYER_DEAD_EMOJI,
  PLAYER_HIDE_EMOJI,
  PLAYER_VISIBLE_EMOJI,
  RING_SYSTEM_EMOJI,
  SPINNER_EMOJI,
  WEAPON_INVENTORY_EMOJI,
} from '../../../../consts/emojis';
import { ITEM_RARITY, ArmorSpecs } from '../../../../consts/global';
import {
  basicHealthDisplayInParentheses,
  generateRarityColorEmoji,
  generateSoldierAnimationEmoji,
  randomSkinColor,
} from '../../../../helpers';
import { ARENA_PERK } from '../../../consts';
import { arenaPerkStats } from '../../../utils';

export function getCheerEmoji(player: ArenaPlayer) {
  if (player.isSpectator) {
    return ':bust_in_silhouette:';
  }

  return player.health <= 0 ? ':rip:' : player.isVisible ? PLAYER_VISIBLE_EMOJI : PLAYER_HIDE_EMOJI;
}

export function playerAndHealthDisplay(data: Array<{ slackId: string; health: number }>) {
  const statusList = data
    .map(({ slackId, health }) => `<@${slackId}> has ${basicHealthDisplayInParentheses(health)}`)
    .join('\n');
  return `${statusList}\n`;
}

export const arenaEngineReply = {
  // ARENA ZONES
  areaReport: (zone: ArenaZone) => `\n\n> ${zone.emoji} *>* *AREA REPORT: ${zone.name}*`,
  zonePenaltyDamageDealt: ({
    damage,
    targetSlackId,
    targetHealth,
  }: {
    damage: number;
    targetSlackId: string;
    targetHealth: number;
  }) =>
    `${targetHealth ? RING_SYSTEM_EMOJI : ':skull:'} ` +
    `Memory Sweeper hit <@${targetSlackId}> ` +
    `for *${damage} damage!*\n` +
    `${targetHealth ? `:running:${randomSkinColor()}:dash:` : ':rip:'} ` +
    `<@${targetSlackId}> ${
      targetHealth ? `now has ${basicHealthDisplayInParentheses(targetHealth)}` : 'is now dead'
    }`,

  // WEAPONS
  weaponCollateralDamage: (weaponEmoji: string) =>
    `${weaponEmoji} :boom: *COLLATERAL DAMAGE!* :boom:`,
  weaponBlastDamage: () => `*${generateSoldierAnimationEmoji()}* :boom: *BLAST DAMAGE!* :boom:`,

  weaponCollateralDamageAvoided: (weaponEmoji: string) =>
    `${weaponEmoji} COLLATERAL DAMAGE *AVOIDED* :blobsweating:`,

  weaponAreaDamage: () => `:booom: AREA DAMAGE :booom:`,

  // BOSS
  bossDealtDamage: (
    bossSlackId: string,
    bossHealth: number,
    damage: number,
    targetSlackId: string,
    targetHealth: number,
    isEveryoneVisible: boolean,
    targetPlayerArmorSpecs: ArmorSpecs | null
  ) =>
    `${targetHealth ? BOSS_EMOJI : ':skull:'} ` +
    `<@${bossSlackId}> ${basicHealthDisplayInParentheses(bossHealth)} ` +
    `${BOSS_WEAPON_EMOJI} hit <@${targetSlackId}> ` +
    `for ${
      targetPlayerArmorSpecs
        ? `~*${damage} damage!*~ ${targetPlayerArmorSpecs.emoji} *${targetPlayerArmorSpecs.damageDealt} damage*`
        : `*${damage} damage!*`
    }\n` +
    `${
      isEveryoneVisible && targetHealth
        ? `:running:${randomSkinColor()}:dash:`
        : targetHealth
        ? PLAYER_HIDE_EMOJI
        : ':rip:'
    } ` +
    `<@${targetSlackId}> ${
      targetHealth ? `now has ${basicHealthDisplayInParentheses(targetHealth)}` : 'is now dead'
    }`,

  bossFailedToHit: (
    bossSlackId: string,
    bossHealth: number,
    targetSlackId: string,
    targetHealth: number
  ) =>
    `:facepalm: <@${bossSlackId}> ${BOSS_EMOJI} ${basicHealthDisplayInParentheses(bossHealth)} ` +
    `${BOSS_WEAPON_EMOJI} _*missed*_ <@${targetSlackId}>\n` +
    `:woman-running:${randomSkinColor()}:dash: ` +
    `${playerAndHealthDisplay([{ slackId: targetSlackId, health: targetHealth }])}`,

  bossHasNobodyToHunt: (slackId: string) =>
    `${BOSS_EMOJI} <@${slackId}> went hunting ${BOSS_WEAPON_EMOJI}\n` +
    ` and *found no one* out in the open.`,

  // PLAYER
  playerFoundHealthKit: (slackId: string, health: number) =>
    `:medkit: <@${slackId}> ${basicHealthDisplayInParentheses(
      health
    )} searched for a health kit and *found one*!`,

  playerFoundNoHealthKit: (slackId: string, health: number) =>
    `:medkit: <@${slackId}> searched for a health kit and *found... nothing* :grimacing:\n` +
    `${playerAndHealthDisplay([{ slackId, health }])}`,

  playerSelfRevive: (slackId: string, health: number) =>
    `${FULL_HEALTH_HEART_EMOJI} <@${slackId}> used a health kit.\n` +
    `${playerAndHealthDisplay([{ slackId, health }])}`,

  playerReviveOther: (
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

  playerFoundWeapon: (
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

  playerFoundArmor: (
    slackId: string,
    health: number,
    armorName: string,
    armorEmoji: string,
    rarity: string
  ) =>
    `${ARMOR_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for an armor and *found one*! ${armorName} ${armorEmoji} (${rarity})!`,

  playerFoundBetterArmor: (
    slackId: string,
    health: number,
    armorName: string,
    armorEmoji: string,
    rarity: string
  ) =>
    `${ARMOR_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for a _new_ armor and *found a better one*! ${armorName} ${armorEmoji} (${rarity})!`,

  playerFoundNoBetterArmor: (
    slackId: string,
    health: number,
    armorName: string,
    armorEmoji: string,
    rarity: string
  ) =>
    `${ARMOR_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for a _new_ armor and *and didn't find something better*! ${armorName} ${armorEmoji} (${rarity})!`,

  playerFoundNoWeapon: (slackId: string, health: number) =>
    `${WEAPON_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for a weapon and *found... nothing*! :grimacing:`,

  playerFoundNoArmor: (slackId: string, health: number) =>
    `${ARMOR_INVENTORY_EMOJI} <@${slackId}> ${basicHealthDisplayInParentheses(health)} ` +
    `searched for an armor and *found... nothing*! :grimacing:`,

  playerWillHide: (slackId: string, health: number) =>
    `${PLAYER_HIDE_EMOJI} <@${slackId}> found a place to hide.\n` +
    `${playerAndHealthDisplay([{ slackId, health }])}`,

  playerDealtDamage: (
    playerSlackId: string,
    playerHealth: number,
    damage: number,
    weaponEmoji: string,
    targetSlackId: string,
    targetHealth: number,
    isEveryoneVisible: boolean,
    targetPlayerArmorSpecs: ArmorSpecs | null,
    isPiercingDamage: boolean
  ) =>
    `${targetHealth ? generateSoldierAnimationEmoji() : ':skull:'} ` +
    `<@${playerSlackId}> ${basicHealthDisplayInParentheses(playerHealth)} ` +
    `${weaponEmoji} hit <@${targetSlackId}> ` +
    `for ${
      targetPlayerArmorSpecs
        ? `~*${damage} damage!*~ ${targetPlayerArmorSpecs.emoji} *${targetPlayerArmorSpecs.damageDealt} damage*`
        : `*${damage} damage!* ${isPiercingDamage ? '(_Piercing Damage_)' : ''}`
    }\n` +
    `${
      isEveryoneVisible && targetHealth
        ? `:running:${randomSkinColor()}:dash:`
        : targetHealth
        ? PLAYER_HIDE_EMOJI
        : ':rip:'
    } ` +
    `<@${targetSlackId}> ${
      targetHealth ? `now has ${basicHealthDisplayInParentheses(targetHealth)}` : 'is now dead'
    }`,

  playerFailedToHit: (
    playerSlackId: string,
    playerHealth: number,
    weaponEmoji: string,
    targetSlackId: string,
    targetHealth: number
  ) =>
    `:facepalm: <@${playerSlackId}> ${basicHealthDisplayInParentheses(playerHealth)} ` +
    `${weaponEmoji} _*missed*_ <@${targetSlackId}>\n` +
    `:woman-running:${randomSkinColor()}:dash: ` +
    `${playerAndHealthDisplay([{ slackId: targetSlackId, health: targetHealth }])}`,

  playerHasNobodyToHunt: (slackId: string, weaponEmoji: string) =>
    `${generateSoldierAnimationEmoji()} <@${slackId}> went hunting ${weaponEmoji}\n` +
    ` and *found no one* out in the open. :eager: Come out little kitties...`,

  playerDrankElixir: (slackId: string) =>
    `<@${slackId}> drank the :edlixir: Luck Elixir and is now *feeling more lucky!*`,

  playerLostAction: (slackId: string, isDead: boolean) =>
    `${isDead ? `${PLAYER_DEAD_EMOJI}` : ':face_with_head_bandage:'} <@${slackId}> lost actions ${
      isDead ? 'because *is dead*' : '_due to damage._'
    }\n`,

  playerCheerSomebody: (player: ArenaPlayer, targetPlayerSlackId: string) =>
    `${
      getCheerEmoji(player)
      //:bust_in_silhouette:
    } ` +
    `<@${player._user?.slackId}> :tada: ` +
    `is cheering on <@${targetPlayerSlackId}>! :claps: :claps: :claps:`,

  playerLootAWeapon: (
    killerPlayerSlackId: string,
    weaponEmoji: string,
    weaponRarity: ITEM_RARITY,
    deadPlayerSlackId: string
  ) =>
    `${LOOT_CRATE_EMOJI} <@${killerPlayerSlackId}> grabbed a ${generateRarityColorEmoji(
      weaponRarity
    )}${weaponEmoji} from <@${deadPlayerSlackId}>`,

  playerLootAHealthkit: (
    killerPlayer: ArenaPlayer,
    deadPlayerSlackId: string,
    isAutoApplied: boolean
  ) =>
    `${LOOT_CRATE_EMOJI} <@${killerPlayer._user?.slackId}> grabbed a ${HEALTH_KIT_EMOJI} from <@${deadPlayerSlackId}>` +
    `${
      isAutoApplied
        ? ` and _*auto-applied*_ it. Now has ( ${FULL_HEALTH_HEART_EMOJI} ${killerPlayer.health} ) `
        : ''
    }`,

  targetPlayerIsDeadOrHide: (
    attackingPlayerSlackId: string,
    deadPlayerSlackId: string,
    isDead: boolean
  ) =>
    `${NO_ENTRY_SIGN} <@${attackingPlayerSlackId}> couldn't attack <@${deadPlayerSlackId}> because ${
      isDead ? `they're dead now. ${PLAYER_DEAD_EMOJI}` : `they're hidden now. ${PLAYER_HIDE_EMOJI}`
    }`,

  playerReceivedPerk: (playerSlackId: string, perkAwarded: ARENA_PERK) => {
    const perkStats = arenaPerkStats(perkAwarded);
    return `${PERK_IMPLEMENTATION_EMOJI} <@${playerSlackId}> achieved a new Perk. ${SPINNER_EMOJI} Implementing ${perkStats}`;
  },

  playerArmorBrokenByArmorbreakingTrait: (
    targetPlayerSlackId: string,
    weaponEmoji: string,
    armorEmoji: string
  ) =>
    `<@${targetPlayerSlackId}>'s ${armorEmoji} armor broke due to ${weaponEmoji}'s *Armor Break* trait!`,
};
