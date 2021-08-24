import { SHARED_ACTIONS } from '../consts/global';
import { generateEnemyPatterns } from '../enemy/helpers/enemyPatterns';

export const TOWER_GIF_URL = 'https://xhq-bucket-campaigns.s3.amazonaws.com/gifs/';
export const BOSS_MIN_DAMAGE_RATE = 20;
export const BOSS_MAX_DAMAGE_RATE = 100;
export const MIN_BOSS_HEALTH = 80;
export const MAX_BOSS_HEALTH = 200;
export const ENEMY_MIN_DAMAGE_RATE = 5;
export const ENEMY_MAX_DAMAGE_RATE = 40;
export const MIN_ENEMY_HEALTH = 20;
export const MAX_ENEMY_HEALTH = 80;

export const TOWER_ACTIONS = {
  ...SHARED_ACTIONS,
  LUCK_ELIXIR: 'luckElixir',
  CHARGE: 'charge',
} as const;

export enum TOWER_SLACK_COMMANDS {
  // ADMIN
  UPDATE_ENEMY = '/tower-updateenemy',
  DELETE_ENEMY = '/tower-deleteenemy',
  CREATE_TOWER = '/tower-newgame',
  FINISH_TOWER = '/tower-endgame',
  SET_TOWER_FLOORS = '/tower-setfloors',
  TOWER_INFO = '/tower-info',
  TOWER_OPEN = '/tower-open',
  TOWER_CLOSED = '/tower-closed',
  DISPLAY_SCOREBOARD = '/tower-scoreboard',
  CREATE_WEAPON = '/tower-create-weapon',
  UPDATE_WEAPON = '/tower-update-weapons',
  // RAIDER
  ACTIONS = '/tower',
  ENTER = '/tower-enter',
  EXIT = '/tower-exit',
  PROGRESS = '/tower-progress',
  START_ROUND = '/tower-startround',
  HIDE = 'tower-hide',
  SEARCH_HEALTH = 'tower-searchforhealth',
  SEARCH_WEAPONS = 'tower-searchforweapons',
  SEARCH_ARMOR = 'tower-searchforarmors',
  HEAL_OR_REVIVE_OTHER = 'tower-reviveother',
  HEAL_OR_REVIVE_SELF = 'tower-reviveself',
  HUNT = 'tower-hunt',
  REPEAT_LAST_ACTION = 'tower-repeatlastaction',
  START_ROUND_FROM_QUESTION = 'tower-startround',
  ACTIONS_FROM_QUESTION = 'tower-actions',
  RE_ENTER_BUTTON = 'tower-enter',
  PROGRESS_BUTTON = 'tower-progress',
}

export enum TOWER_SECONDARY_SLACK_ACTIONS {
  // ADMIN
  CREATE_OR_UPDATE_ENEMY_DATA = 'create_or_update_enemy_data',
  REMOVE_ENEMY_FROM_TOWER_FLOOR = 'tower-settowerfloor-floor-enemy-remove',
  ADD_ENEMY_TO_TOWER_FLOOR = 'tower-settowerfloor-floor-enemy-add',
  ADD_ENEMY_AMOUNT_TO_TOWER_FLOOR = 'tower-settowerfloor-enemy',
  ADD_ENEMY_TO_TOWER_FLOOR_BTN_YES = 'tower-settowerfloor-btnyes',
  ADD_ENEMY_TO_TOWER_FLOOR_BTN_NO = 'tower-settowerfloor-btnno',
  CREATE_OR_UPDATE_WEAPON_DATA = 'create_or_update_weapon_data',
  UPDATE_TOWER_ID = 'tower-update',
  UPDATE_TOWER_FLOOR_ID = 'tower-settowerfloor-byfloor',
  ENABLE_HIDING = 'tower-settowerfloor-enable-hiding',
  DISABLE_HIDING = 'tower-settowerfloor-disable-hiding',
  CONFIRM_END_GAME = 'tower-confirm-endgame',
  CANCEL_END_GAME = 'tower-cancel-endgame',
  // RAIDER
  HUNT_CHOOSE_WEAPON = 'tower-hunt-choose-weapon',
  HUNT_CHOOSE_TARGET = 'tower-hunt-choose-target',
  HEAL_OR_REVIVE_CHOOSE_TARGET = 'tower-reviveother-choose-target',
  CHOOSE_PERK = 'tower-raider-choose-perk',
  CHOOSE_ITEM = 'tower-raider-choose-item',
}

export enum TOWER_FLOOR_HIDING {
  ENABLE = 'enable',
  DISABLE = 'disable',
}

export enum TOWER_LOOT_PRIZES {
  ITEM = 'item',
  WEAPON = 'weapon',
  ARMOR = 'armor',
}

// GAME
export const DEFAULT_MAX_FLOOR_NUMBER = 10;
export const DEFAULT_LUNA_PRIZE = 5;
export const DEFAULT_COIN_PRIZE = 5;
export const LOOT_PRIZE_WEAPON_CHANCE = 0.5;
export const LOOT_PRIZE_ARMOR_CHANCE = 0.25;
export const LOOT_PRIZE_ITEM_CHANCE = 0.25;
export const HEALTHKIT_ITEM_CHANCE = 0.95;
export const LUCKELIXIR_ITEM_CHANCE = 0.05;
export const LOSE_ACTION_RATE = 0.6;
export const INITIATIVE_WEAPON_DAMAGE_THRESHOLD = 0.6;
export const INITIATIVE_INCREASE = 0.02;
export const INITIATIVE_DECREASE = -0.01;

// RAIDER
export const SEARCH_WEAPONS_SUCCESS_RATE = 0.6;
export const SEARCH_ARMOR_SUCCESS_RATE = 0.6;
export const SEARCH_HEALTH_SUCCESS_RATE = 0.6;
export const HUNT_SUCCESS_RATE = 0.8;
export const HEALTHKIT_HEALING = 20;
export const MAX_RAIDER_HEALTH = 120;
export const SEARCH_HEALTH_FOUND_QTY = 1;
export const MAX_AMOUNT_HEALTHKITS_ALLOWED = 4;
export const LUCK_ELIXIR_BOOST = 0.2;
export const DEFAULT_SORT_INITIATIVE_SUCCESS_RATE = 0.6;

// ENEMIES
export const ENEMY_HUNT_SUCCESS_RATE = 0.8;
export const ENEMY_HUNT_CHANCE = 0.8;
export const ENEMY_HIDE_CHANCE = 0.2;
export const ENEMY_DEFAULT_SORT_INITIATIVE_SUCCESS_RATE = 0.4;
const TOWER_ENEMY_PATTERN_LENGTH = 4;
export const TOWER_ENEMY_PATTERNS = generateEnemyPatterns(TOWER_ENEMY_PATTERN_LENGTH);

// WEAPON
export const LEGENDARY_WEAPON_CHANCE = 0.1;
export const EPIC_WEAPON_CHANCE = 0.15;
export const RARE_WEAPON_CHANCE = 0.25;
export const COMMON_WEAPON_CHANCE = 0.5;

// ARMOR
export const LEGENDARY_ARMOR_CHANCE = 0.05;
export const EPIC_ARMOR_CHANCE = 0.15;
export const RARE_ARMOR_CHANCE = 0.3;
export const COMMON_ARMOR_CHANCE = 0.5;
