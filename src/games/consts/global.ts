export const ZERO = 0;
export const ONE = 1;
export const TWO = 2;
export const TEN = 10;
export const THREE = 3;
export const HUNDRED = 100;
export const SLACK_SPACE = '\u0020';

export enum GAME_TYPE {
  TOWER = 'The Tower',
  ARENA = 'The Arena',
}

export enum TRAIT {
  ARMORBREAK = 'armorbreak',
  BLAST_2 = 'blast_2',
  BLAST_3 = 'blast_3',
  BLAST_ALL = 'blast_all',
  DETECT = 'detect',
  DUALSTRIKE = 'dualstrike',
  PIERCING = 'piercing',
  PRECISION = 'precision',
  STEALTH = 'stealth',
  UNSEARCHABLE = 'unsearchable',
  INITIAL = 'initial',
}

export enum ITEM_TYPE {
  HEALTH_KIT = 'health kit',
  WEAPON = 'weapon',
  ARMOR = 'armor',
}

export enum ITEM_RARITY {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

export enum PERK_ARCHETYPE {
  VANGUARD = 'vanguard',
  DEFENDER = 'defender',
  AVENGER = 'avenger',
}

export enum PERK {
  // VANGUARD
  HYPER = 'hyper', // Common
  LOCK_ON = 'lockon', // Rare
  FRONTLINER = 'frontliner', // Epic
  SHARPSHOOTER = 'sharpshooter', // Legendary

  // DEFENDER
  UNSTOPPABLE = 'unstoppable', // Common
  ENDURANCE = 'endurance', // Rare
  VIGOR = 'vigor', // Epic
  HERBOLOGY = 'herbology', // Legendary

  // AVENGER
  FOCUSED_VIEW = 'focusedview', // Common
  CHARGE = 'charge', // Rare
  ADRENALINE = 'adrenaline', // Epic
  NINJITSU = 'ninjitsu', // Legendary
}

export enum PERK_CONDITIONS {
  // ADRENALINE
  ADRENALINE_FIRST_HP_THRESHOLD = 60,
  ADRENALINE_SECOND_HP_THRESHOLD = 40,
  ADRENALINE_THIRD_HP_THRESHOLD = 20,
  // VIGOR
  VIGOR_FIRST_HP_THRESHOLD = 80,
  VIGOR_SECOND_HP_THRESHOLD = 100,
  VIGOR_THIRD_HP_THRESHOLD = 120,
  // CHARGE
}
export type PerkConditionKey = keyof typeof PERK_CONDITIONS;

export enum PERK_MULTIPLIERS {
  ADRENALINE = 2, // Checked
  VIGOR = 2, // checked
  CHARGE = 2,
}

export type PerkMultiplierKey = keyof typeof PERK_MULTIPLIERS;

export const SHARED_ACTIONS = {
  SEARCH_WEAPONS: 'searchWeapons',
  SEARCH_HEALTH: 'searchHealth',
  SEARCH_ARMOR: 'searchArmor',
  HUNT: 'hunt',
  REVIVE: 'revive',
  HIDE: 'hide',
} as const;

export enum GAME_ACTION_MAPPING {
  HUNT = 'A', // Attack
  HIDE = 'H', // Hide
  CHARGE = 'C', // Charge
}

export const SORT_ACTION_ARRAY_RATE = 0.5;
export const SELECT_TEAM_URL = 'https://xhq.x-team.com/profile';

export interface ArmorSpecs {
  rarity: ITEM_RARITY;
  damageDealt: number;
  emoji: string;
}

export interface DamageDealtSpecs {
  originalDamage: number;
  newDamage?: number;
  armorSpecs?: ArmorSpecs;
  wasOriginatedByPerk: boolean;
}
