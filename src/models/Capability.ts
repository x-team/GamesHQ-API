import type { Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  Unique,
  PrimaryKey,
} from 'sequelize-typescript';

import { CAPABILITIES } from '../consts/model';

import { UserRole, UserRoleCapability } from '.';

interface CapabilityAttributes {
  id: number;
  name: string;
}
@Table
export class Capability extends Model<CapabilityAttributes> {
  @PrimaryKey
  @Unique
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column(DataType.TEXT)
  declare name: CAPABILITIES;

  @BelongsToMany(() => UserRole, {
    through: () => UserRoleCapability,
    foreignKey: '_capabilityId',
    otherKey: '_userRoleId',
  })
  declare _userRoles?: UserRole[];

  static associations: {
    _userRoles: Association<Capability, UserRole>;
  };
}
