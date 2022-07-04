import type { Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
  Unique,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import { UserRole, UserRoleCapability } from '.';

export interface CapabilityAttributes {
  id: number;
  name: string;
}

export interface CapabilityCreateAttributes {
  name: string;
}
@Table
export class Capability extends Model<CapabilityAttributes, CapabilityCreateAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column(DataType.TEXT)
  declare name: string;

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

export const findAllCapabilties = async () => {
  return await Capability.findAll();
};

export const createCapability = async (data: CapabilityCreateAttributes) => {
  return await Capability.create(data);
};

export const deleteCapability = async (id: number) => {
  return await Capability.destroy({ where: { id } });
};
