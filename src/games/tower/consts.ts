import { SHARED_ACTIONS } from '../consts/global';

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

// GAME
export const MAX_FLOOR_NUMBER = 10;
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
