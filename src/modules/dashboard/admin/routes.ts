import type { ServerRoute } from '@hapi/hapi';

import { getCurrentArenaGameStateRoute } from './adminRoutes/arenaAdminRoutes';
import { getAllCapabilitiesRoute } from './adminRoutes/capabilityAdminRoutes';
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
  endCurrentTowerGameRoute,
  openOrCloseCurrentTowerRoute,
  addEnemyToFloorRoute,
} from './adminRoutes/towerAdminRoutes';
import { getAllUserRolesRoute } from './adminRoutes/userRoleAdminRoutes';
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
  endCurrentTowerGameRoute,
  openOrCloseCurrentTowerRoute,
  addEnemyToFloorRoute,
  // capability
  getAllCapabilitiesRoute,
  //userRole
  getAllUserRolesRoute,
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
