import { random } from 'lodash';

import type {
  ArenaItemInventory,
  ArenaZone,
  Item,
  Perk,
  PerkInventory,
  TowerItemInventory,
} from '../../models';
import { ARENA_PERK } from '../arena/consts';
import { hasArenaPerk } from '../arena/repositories/arena/engine/cheerSystem';
import { arenaPerkStats } from '../arena/utils';
import {
  COMMON_COLOR_EMOJI_BIG,
  COMMON_COLOR_EMOJI_SMALL,
  EMPTY_HEALTH_HEART_EMOJI,
  EPIC_COLOR_EMOJI_BIG,
  EPIC_COLOR_EMOJI_SMALL,
  FREE_AGENT_EMOJI,
  FULL_HEALTH_HEART_EMOJI,
  HALF_HEALTH_HEART_EMOJI,
  INITIATIVE_EMOJI,
  LEGENDARY_COLOR_EMOJI_BIG,
  LEGENDARY_COLOR_EMOJI_SMALL,
  PERK_IMPLEMENTATION_EMOJI,
  PLAYER_HIDE_EMOJI,
  PLAYER_VISIBLE_EMOJI,
  RARE_COLOR_EMOJI_BIG,
  RARE_COLOR_EMOJI_SMALL,
  WEAPON_INVENTORY_EMOJI,
} from '../consts/emojis';
import { ITEM_RARITY, ITEM_TYPE, SLACK_SPACE, ZERO } from '../consts/global';
import { rateToPercentage } from '../utils';

export const randomSkinColor = () => {
  const MIN_TONE = 2;
  const MAX_TONE = 6;
  const skinColor = random(MIN_TONE, MAX_TONE);
  return `:skin-tone-${skinColor}:`;
};

export interface RoundActionMessageBuilderParams {
  actionText: string;
  emoji: string;
  isVisible: boolean;
  secondaryMessage?: string;
  additionalMessages?: string[];
}

export function roundActionMessageBuilder(
  actionText: string,
  emoji: string,
  isVisible: boolean,
  secondaryMessage?: string,
  additionalMessages?: string[]
) {
  return (
    'When the round begins...\n' +
    `\t- You will ${actionText} ${emoji}\n` +
    `${secondaryMessage ? `\t- ${secondaryMessage}\n` : ''}` +
    `${additionalMessages ? additionalMessages.map((msg) => `\t- ${msg}\n`).join('') : ''}` +
    `\t- ${
      isVisible
        ? `*You will be visible.* ${PLAYER_VISIBLE_EMOJI} Keep your head down!`
        : `*You will remain hidden* ${PLAYER_HIDE_EMOJI}`
    }`
  );
}

export function basicHealthDisplayInParentheses(health: number) {
  return `( ${FULL_HEALTH_HEART_EMOJI} ${health} )`;
}

export function basicHealthDisplay(health: number, maxHealth: number) {
  return `${
    health === 0
      ? EMPTY_HEALTH_HEART_EMOJI
      : health < maxHealth
      ? HALF_HEALTH_HEART_EMOJI
      : FULL_HEALTH_HEART_EMOJI
  } (${health}) `;
}

export function generateSoldierAnimationEmoji() {
  // This is a more declarative way to create the name
  // Instead of a one line functional programming way
  return `:arena-soldier-grenade:`;
  /* const [gameName, ...weaponName] = weaponEmoji.trim().replace(/:/g, '').split('-');
  return `:${gameName}-soldier-${weaponName.join('-')}:`; */
}

export function zoneStatus(zone: ArenaZone) {
  return `> ${zone.emoji} *Location >* ${zone.name}`;
}

export function generateHealthBar(maxHealth: number, currenthealth: number): string {
  const SPACE = `${SLACK_SPACE}`;
  const HEALTH_VALUE_OF_ONE_HEART = 10;
  const ZERO = 0;
  const ONE = 1;
  const healthBarLength = Math.ceil(maxHealth / HEALTH_VALUE_OF_ONE_HEART);
  const fullHeartsLength = Math.floor(currenthealth / HEALTH_VALUE_OF_ONE_HEART);
  const halfHeartsLength = currenthealth % HEALTH_VALUE_OF_ONE_HEART === ZERO ? ZERO : ONE;
  const emptyHeartsLength = healthBarLength - (fullHeartsLength + halfHeartsLength);
  return `( ${currenthealth} / ${maxHealth} ) ${Array(fullHeartsLength)
    .fill(FULL_HEALTH_HEART_EMOJI)
    .concat(
      Array(halfHeartsLength).fill(HALF_HEALTH_HEART_EMOJI),
      Array(emptyHeartsLength).fill(EMPTY_HEALTH_HEART_EMOJI)
    )
    .join(SPACE)}`;
}

export function initiativeStatus(initiative: number) {
  return `${INITIATIVE_EMOJI} *Initiative:* ${rateToPercentage(initiative)}`;
}

export function weaponStatus(
  weapons: Array<
    Item & ({ ArenaItemInventory: ArenaItemInventory } | { TowerItemInventory: TowerItemInventory })
  >
) {
  return `${WEAPON_INVENTORY_EMOJI} *Inventory:* ${
    weapons?.length
      ? `\n${weapons
          .map((weapon) => {
            const { name, emoji, _itemRarityId } = weapon;
            const arenaWeapon = weapon as Item & { ArenaItemInventory: ArenaItemInventory };
            const towerWeapon = weapon as Item & {
              TowerItemInventory: TowerItemInventory;
            };
            let mutableRemainingUses: number | null | undefined = null;
            if (arenaWeapon.ArenaItemInventory) {
              mutableRemainingUses = arenaWeapon.ArenaItemInventory.remainingUses;
            } else if (towerWeapon.TowerItemInventory) {
              mutableRemainingUses = towerWeapon.TowerItemInventory.remainingUses;
            }

            let traitsAddon;

            if (weapon._traits?.length === 0) {
              traitsAddon = '\t\t_No traits_\n';
            } else {
              traitsAddon = weapon._traits?.reduce((finalString, trait) => {
                return (finalString += `\t\t_${trait.displayName}: ${trait.shortDescription}_\n`);
              }, '');
            }

            return (
              `\t*[* ${generateRarityColorEmoji(_itemRarityId)} ${emoji} ${name} | ${
                mutableRemainingUses ? `_${mutableRemainingUses} Use(s) Left_` : '_Unlimited use_'
              } *]*\n` + traitsAddon
            );
          })
          .join(`${SLACK_SPACE}`)}`
      : '(no weapon)'
  }`;
}

export function armorStatus(
  armors: Array<
    Item & ({ ArenaItemInventory: ArenaItemInventory } | { TowerItemInventory: TowerItemInventory })
  >
) {
  const armor = armors.length ? armors[ZERO] : null;
  if (!armor) {
    return '${ARMOR_INVENTORY_EMOJI} *Inventory:* (no armor)';
  }
  const { name, emoji, _armor } = armor;
  const arenaArmor = armor as Item & { ArenaItemInventory: ArenaItemInventory };
  const towerArmor = armor as Item & { TowerItemInventory: TowerItemInventory };
  let mutableRemainingUses: number | null | undefined = null;
  if (arenaArmor.ArenaItemInventory) {
    mutableRemainingUses = arenaArmor.ArenaItemInventory.remainingUses;
  } else if (towerArmor.TowerItemInventory) {
    mutableRemainingUses = towerArmor.TowerItemInventory.remainingUses;
  }
  return (
    `${emoji} *Inventory:* ` +
    `*[* ${name} ` +
    `_(${rateToPercentage(_armor?.reductionRate ?? ZERO)})_ ` +
    `| ${mutableRemainingUses ? `_${mutableRemainingUses} Use(s) Left_` : '_Unlimited use_'} *]*`
  );
}

export function healthKitStatus(
  items: Array<
    Item & ({ ArenaItemInventory: ArenaItemInventory } | { TowerItemInventory: TowerItemInventory })
  >
) {
  const healthkitFound = items.length
    ? items.find(({ name }) => name === ITEM_TYPE.HEALTH_KIT)
    : null;
  if (!healthkitFound) {
    return ':medkit: *Health kits:* 0';
  }
  const arenaHealthkitItem = healthkitFound as Item & { ArenaItemInventory: ArenaItemInventory };
  const towerHealthkit = healthkitFound as Item & { TowerItemInventory: TowerItemInventory };
  let mutableQuantity = 0;
  if (arenaHealthkitItem.ArenaItemInventory) {
    mutableQuantity = arenaHealthkitItem.ArenaItemInventory.remainingUses ?? ZERO;
  } else if (towerHealthkit.TowerItemInventory) {
    mutableQuantity = towerHealthkit.TowerItemInventory.remainingUses ?? ZERO;
  }
  return `:medkit: *Health kits:* ${mutableQuantity}`;
}

export function perkStatus(perks: Array<Perk & { PerkInventory: PerkInventory }>) {
  const matchParentheses = new RegExp(/\(([^)]+)\)/, 'g');
  return `${PERK_IMPLEMENTATION_EMOJI} *Perks:*${
    perks?.length
      ? `\n${perks
          .map(
            ({ name, emoji, description, PerkInventory: { quantity } }) =>
              `\t*[* ${emoji} ${name} _${
                description.match(matchParentheses)![0]
              }_ | _${quantity}_ *]*\n`
          )
          .join(`${SLACK_SPACE}`)}`
      : ' (No perks implemented)'
  }`;
}

export function cheerSystemStatus(cheersAmount?: number) {
  const perksWithStats: string[] = [];
  if (cheersAmount) {
    Object.values(ARENA_PERK)
      .filter((perkValue) => !isNaN(Number(perkValue)))
      .forEach((perkValue) => {
        if (hasArenaPerk(perkValue as ARENA_PERK, cheersAmount)) {
          perksWithStats.push(`\t${arenaPerkStats(perkValue as ARENA_PERK)}\n`);
        }
      });
  }
  return `${PERK_IMPLEMENTATION_EMOJI} *Perks:*${
    cheersAmount ? `\n${perksWithStats.join(`${SLACK_SPACE}`)}` : ' (No perks implemented)'
  }`;
}

export function generateRarityColorEmoji(rarity: ITEM_RARITY, getBigEmoji = false): string {
  switch (rarity) {
    case ITEM_RARITY.COMMON:
      return getBigEmoji ? COMMON_COLOR_EMOJI_BIG : COMMON_COLOR_EMOJI_SMALL;
    case ITEM_RARITY.RARE:
      return getBigEmoji ? RARE_COLOR_EMOJI_BIG : RARE_COLOR_EMOJI_SMALL;
    case ITEM_RARITY.EPIC:
      return getBigEmoji ? EPIC_COLOR_EMOJI_BIG : EPIC_COLOR_EMOJI_SMALL;
    case ITEM_RARITY.LEGENDARY:
      return getBigEmoji ? LEGENDARY_COLOR_EMOJI_BIG : LEGENDARY_COLOR_EMOJI_SMALL;
    default:
      return getBigEmoji ? COMMON_COLOR_EMOJI_BIG : COMMON_COLOR_EMOJI_SMALL;
  }
}

export function generateTeamEmoji(emoji: string | null | undefined) {
  if (!emoji) {
    return FREE_AGENT_EMOJI;
  }
  return emoji;
}
