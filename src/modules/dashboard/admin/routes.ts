import type { ServerRoute } from '@hapi/hapi';

import {
  getCurrentArenaGameStateRoute,
  arenaCommandRoute,
  arenaActionRoute,
} from './adminRoutes/arenaAdminRoutes';
import {
  getAllCapabilitiesRoute,
  createCapabilityRoute,
  deleteCapabilityRoute,
} from './adminRoutes/capabilityAdminRoutes';
import {
  getEnemyRoute,
  getEnemiesRoute,
  deleteEnemyRoute,
  upsertEnemyRoute,
} from './adminRoutes/enemyAdminRoutes';
import { getEmojisRoute } from './adminRoutes/generalAdminRoutes';
import {
  getTowerGameStatusRoute,
  newTowerGameRoute,
  updateTowerGameRoute,
  endCurrentTowerGameRoute,
  openOrCloseCurrentTowerRoute,
  addEnemyToFloorRoute,
  addTowerFloorRoute,
  removeTowerFloorRoute,
} from './adminRoutes/towerAdminRoutes';
import {
  getAllUserRolesRoute,
  upsertUserRolesRoute,
  deleteUserRolesRoute,
} from './adminRoutes/userRoleAdminRoutes';
import {
  getWeaponsRoute,
  getWeaponByIdRoute,
  upsertWeaponRoute,
  deleteWeaponRoute,
} from './adminRoutes/weaponAdminRoutes';
import {
  getZoneRoute,
  getZonesRoute,
  deleteZoneRoute,
  upsertZoneRoute,
} from './adminRoutes/zoneAdminRoutes';

export const adminRoutes: ServerRoute[] = [
  //arena
  getCurrentArenaGameStateRoute,
  arenaCommandRoute,
  arenaActionRoute,
  //enemy
  getEnemyRoute,
  getEnemiesRoute,
  deleteEnemyRoute,
  upsertEnemyRoute,
  //general
  getEmojisRoute,
  //tower
  getTowerGameStatusRoute,
  newTowerGameRoute,
  updateTowerGameRoute,
  endCurrentTowerGameRoute,
  openOrCloseCurrentTowerRoute,
  addEnemyToFloorRoute,
  addTowerFloorRoute,
  removeTowerFloorRoute,
  // capability
  getAllCapabilitiesRoute,
  createCapabilityRoute,
  deleteCapabilityRoute,
  //userRole
  getAllUserRolesRoute,
  upsertUserRolesRoute,
  deleteUserRolesRoute,
  //weapon
  getWeaponsRoute,
  getWeaponByIdRoute,
  upsertWeaponRoute,
  deleteWeaponRoute,
  //zone
  getZoneRoute,
  getZonesRoute,
  deleteZoneRoute,
  upsertZoneRoute,
];
