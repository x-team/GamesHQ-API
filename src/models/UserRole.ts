import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Unique,
  PrimaryKey,
  BelongsToMany,
} from 'sequelize-typescript';

import { withTransaction } from '../db';

import { User, Capability, UserRoleCapability } from './';

interface UserRoleAttributes {
  id: number;
  name: string;
}

export interface UserRoleCreationAttributes {
  id?: number;
  name: string;
  _capabilities?: Capability[];
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['name'],
    },
  ],
})
export class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> {
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column(DataType.TEXT)
  declare name: string;

  @HasMany(() => User, '_roleId')
  declare _users?: User[];

  @BelongsToMany(() => Capability, {
    through: () => UserRoleCapability,
    foreignKey: '_userRoleId',
    otherKey: '_capabilityId',
  })
  declare _capabilities?: Capability[];

  static associations: {
    _users: Association<UserRole, User>;
    _capabilities: Association<UserRole, Capability>;
  };
}

export function findAllUserRolesWithCapabilties(transaction?: Transaction) {
  return UserRole.findAll({
    include: [
      {
        association: UserRole.associations._capabilities,
      },
    ],
    transaction,
  });
}

export async function createOrUpdateUserRole(
  data: UserRoleCreationAttributes
): Promise<UserRole | void> {
  return withTransaction(async (transaction) => {
    let userRoleId: number;

    if (data.id) {
      userRoleId = data.id;

      //clearing association
      if (data._capabilities) {
        await UserRoleCapability.destroy({
          where: {
            _userRoleId: data.id,
          },
          transaction,
        });
      }
    } else {
      const lastId = await UserRole.findOne({ order: [['id', 'DESC']], transaction });
      userRoleId = (lastId?.id || 0) + 1;
    }

    const [userRole] = await UserRole.upsert(
      {
        ...data,
        id: userRoleId,
      },
      {
        transaction,
      }
    );

    if (data._capabilities) {
      await UserRoleCapability.bulkCreate(
        data._capabilities?.map(
          (c) =>
            ({
              _userRoleId: userRole.id,
              _capabilityId: c.id,
            } || [])
        ),
        {
          include: [
            {
              association: UserRoleCapability.associations._capability,
            },
          ],
          transaction,
        }
      );
    }

    return userRole;
  });
}

export async function findUserRoleByName(name: string) {
  return UserRole.findOne({ where: { name } });
}

export async function deleteUserRole(id: number) {
  return UserRole.destroy({ where: { id } });
}
