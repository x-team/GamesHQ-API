import type { Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import { UserRole, Capability } from '.';

interface UserRoleCapabilityAttributes {
  id: number;
  _userRoleId: number;
  _capabilityId: number;
}

interface UserRoleCapabilityCreateAttributes {
  _userRoleId: number;
  _capabilityId: number;
}

@Table
export class UserRoleCapability extends Model<
  UserRoleCapabilityAttributes,
  UserRoleCapabilityCreateAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => UserRole)
  @Column(DataType.INTEGER)
  declare _userRoleId: number;

  @BelongsTo(() => UserRole, {
    foreignKey: '_userRoleId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _userRole: UserRole;

  @ForeignKey(() => Capability)
  @Column(DataType.INTEGER)
  declare _capabilityId: number;

  @BelongsTo(() => Capability, {
    foreignKey: '_capabilityId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _capability: Capability;

  static associations: {
    _userRole: Association<UserRoleCapability, UserRole>;
    _capability: Association<UserRoleCapability, Capability>;
  };
}
