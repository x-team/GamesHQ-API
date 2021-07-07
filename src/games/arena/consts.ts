import { SHARED_ACTIONS } from '../consts/global';

export const ARENA_ACTIONS = {
  ...SHARED_ACTIONS,
  CHEER: 'cheer',
  STAY_ON_LOCATION: 'idleStayOnLocation',
};

export enum ARENA_ZONE_RING {
  ONE_A = '1A',
  ONE_B = '1B',
  ONE_C = '1C',
  ONE_D = '1D',
  TWO_A = '2A',
  TWO_B = '2B',
  TWO_C = '2C',
  TWO_D = '2D',
  THREE_A = '3A',
  THREE_B = '3B',
  THREE_C = '3C',
  THREE_D = '3D',
  FOUR_A = '4A',
  FOUR_B = '4B',
  FOUR_C = '4C',
  FOUR_D = '4D',
  FIVE = '5',
}

export enum ARENA_PLAYER_PERFORMANCE {
  DAMAGE_DEALT = 'damageDealt',
  HEALED = 'healed',
  KILLS = 'kills',
  WEAPONS_FOUND = 'weaponsFound',
  CHEERS_GIVEN = 'cheersGiven',
  CHEERS_RECEIVED = 'cheersReceived',
}

// GAME
export const MAX_TOP_OUTSTANDING_PERFORMANCE = 3;
export const MAX_AMOUNT_HEALTHKITS_ALLOWED = 1;

// PLAYER
export const MAX_PLAYER_HEALTH = 100;

// ZONES
export const MAX_PLAYERS_PER_ARENA_ZONE = 50;

// RING SYSTEM
export const RING_SYSTEM_MAX_PENALTY_NUMBER = 6;
export const RING_SYSTEM_BASE_DAMAGE = 2;

// WEAPON
export const LEGENDARY_WEAPON_CHANCE = 0.1;
export const EPIC_WEAPON_CHANCE = 0.2;
export const RARE_WEAPON_CHANCE = 0.3;
export const COMMON_WEAPON_CHANCE = 0.4;

// ARMOR
export const LEGENDARY_ARMOR_CHANCE = 0.1;
export const EPIC_ARMOR_CHANCE = 0.2;
export const RARE_ARMOR_CHANCE = 0.3;
export const COMMON_ARMOR_CHANCE = 0.4;

// BOSS
export const INSTANT_KILL_RATE = 0.25;
export const MAX_BOSS_HEALTH = 2000;
export const BOSS_MINOR_DAMAGE = 90;
export const BOSS_MAJOR_DAMAGE = 99;
export const BOSS_HUNT_SUCCESS_RATE = 1;
