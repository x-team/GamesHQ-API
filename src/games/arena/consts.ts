import type { ArenaPlayer, ArenaZone } from '../../models';
import { SHARED_ACTIONS } from '../consts/global';

export const ARENA_ACTIONS = {
  ...SHARED_ACTIONS,
  CHEER: 'cheer',
  STAY_ON_LOCATION: 'idleStayOnLocation',
} as const;

export enum ARENA_PERK {
  ATTACK_PERK,
  DEFENSE_PERK,
  STUN_RESISTANCE_PERK,
  ACCURACY_PERK,
  ADRENALINE_PERK,
}

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

export enum ARENA_SLACK_COMMANDS {
  // ADMIN COMMANDS
  NEW_GAME = '/arena-newgame',
  END_GAME = '/arena-endgame',
  MAKE_ALL_VISIBLE = '/arena-makeallvisible',
  GIVE_EVERYONE_WEAPON = '/arena-giveweapons',
  ADD_PLAYER = '/arena-addplayer',
  ADD_SPECTATOR = '/arena-addspectator',
  START_ROUND = '/arena-startround',
  LIST_PLAYERS = '/arena-listplayers',
  LIST_SPECTATORS = '/arena-listspectators',
  LIST_IDLE = '/arena-listidle',
  ADD_BOSS = '/arena-addboss',
  ADD_GUEST = '/arena-addguest',
  REVIVE_BOSS = '/ta-reviveboss',
  PERFORMANCE = '/arena-performance',
  // WEAPONS
  NARROW_WEAPONS = '/arena-narrowweapons',
  // ZONES
  CREATE_ZONE = '/arena-create-zone',
  UPDATE_ZONE = '/arena-update-zones',
  NARROW_ZONES = '/arena-narrow-zones',
  ENABLE_ZONE_DEACTIVATION = '/arena-zonedeactivation-on',
  DISABLE_ZONE_DEACTIVATION = '/arena-zonedeactivation-off',
  // PLAYER COMMANDS
  ACTIONS = '/arena',
  STATUS = 'arena-status',
  HIDE = 'arena-hide',
  SEARCH_HEALTH = 'arena-searchforhealth',
  SEARCH_WEAPONS = 'arena-searchforweapons',
  SEARCH_ARMOR = 'arena-searchforarmors',
  HEAL_OR_REVIVE_OTHER = 'arena-reviveother',
  HEAL_OR_REVIVE_SELF = 'arena-reviveself',
  HUNT = 'arena-hunt',
  CHEER = 'arena-cheer',
  REPEAT_LAST_CHEER = 'arena-repeatlastcheer',
  CHANGE_LOCATION = 'arena-change-location',
}

export enum ARENA_SECONDARY_ACTIONS {
  HUNT_CHOOSE_WEAPON = 'arena-hunt-choose-weapon',
  HUNT_CHOOSE_TARGET = 'arena-hunt-choose-target',
  CHEER_CHOOSE_TARGET = 'arena-cheer-choose-target',
  HEAL_OR_REVIVE_CHOOSE_TARGET = 'arena-reviveother-choose-target',
  CONFIRM_END_GAME = 'arena-confirm-endgame',
  CANCEL_END_GAME = 'arena-cancel-endgame',
  CHANGE_LOCATION = 'arena-change-location-action',
  CONFIRM_GIVE_EVERYONE_WEAPONS = 'arena-confirm-give-everyone-weapons',
  CONFIRM_NARROW_WEAPONS = 'confirm-narrow-weapons',
  CONFIRM_NARROW_ZONES = 'confirm-narrow-zones',
  CREATE_OR_UPDATE_ZONE_DATA = 'create-or-update-zone-data',
  UPDATE_ZONE = 'update-zone',
  DELETE_ZONE = 'delete-zone',
}

// REPOSITORIES
export const ARENA_REPOSITORY_NAME = 'arena-repository';
export const ZONE_REPOSITORY_NAME = 'zone-repository';

// GAME
export const MAX_TOP_OUTSTANDING_PERFORMANCE = 3;
export const MAX_AMOUNT_HEALTHKITS_ALLOWED = 1;

// PLAYER
export const MAX_PLAYER_HEALTH = 100;
export const ADRENALINE_THRESHOLD = 50;

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
export const BOSS_HEALTHKIT_HEALING = 100;

export interface ChangeLocationParams {
  player: ArenaPlayer;
  arenaZonesAvailable: ArenaZone[];
}
