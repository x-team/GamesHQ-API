import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

import type { ARENA_ACTIONS } from '../games/arena/consts';
import type { SHARED_ACTIONS } from '../games/consts/global';
import type { TOWER_ACTIONS } from '../games/tower/consts';

type Values<T> = T[keyof T];
type GAME_ACTIONS =
  | Values<typeof SHARED_ACTIONS>
  | Values<typeof TOWER_ACTIONS>
  | Values<typeof ARENA_ACTIONS>;

interface AvailableActionAttributes {
  id: GAME_ACTIONS;
}

interface AvailableActionCreationAttributes {
  id: GAME_ACTIONS;
}

@Table
export class AvailableAction
  extends Model<AvailableActionAttributes, AvailableActionCreationAttributes>
  implements AvailableActionAttributes
{
  @PrimaryKey
  @Column(DataType.TEXT)
  declare id: GAME_ACTIONS;
}

export interface GameAction {
  id: GAME_ACTIONS;
  weaponId?: number;
}

export interface ArenaAction extends GameAction {
  locationId?: number;
  targetPlayerId?: number;
}

export interface TowerAction extends GameAction {
  targetFloorBattlefieldEnemyId?: number;
  targetRaiderId?: number;
}
