export const ZERO = 0;
export const ONE = 1;
export const TWO = 2;
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

export const SHARED_ACTIONS = {
  SEARCH_WEAPONS: 'searchWeapons',
  SEARCH_HEALTH: 'searchHealth',
  SEARCH_ARMOR: 'searchArmor',
  HUNT: 'hunt',
  REVIVE: 'revive',
  HIDE: 'hide',
};

export const SORT_ACTION_ARRAY_RATE = 0.5;
