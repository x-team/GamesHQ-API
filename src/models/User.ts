import type { Transaction, Association } from 'sequelize';
import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  Scopes,
  Table,
  Unique,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
} from 'sequelize-typescript';

import { USER_ROLE_NAME } from '../consts/model';
import { ZERO } from '../games/consts/global';
import { GameError } from '../games/utils/GameError';
import { isScopeRole } from '../utils/permissions';

import { UserRole, Organization } from './';

interface UserAttributes {
  id: number;
  slackId: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  displayName: string;
  profilePictureUrl: string | null;
  _roleId: number | null;
  _organizationId: number;
}

interface UserCreationAttributes {
  id?: number;
  slackId: string | null;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  displayName: string;
  profilePictureUrl: string | null;
  firebaseUserUid: string | null;
  _roleId: number | null;
  _organizationId: number;
}

@DefaultScope(() => ({
  attributes: [
    'id',
    'email',
    'slackId',
    'firebaseUserUid',
    'createdAt',
    'displayName',
    'profilePictureUrl',
    '_roleId',
  ],
  include: [User.associations._role],
}))
@Scopes(() => ({
  forRole(scope: string[]) {
    const isAdminOrSuperAdmin =
      isScopeRole(scope, USER_ROLE_NAME.ADMIN) || isScopeRole(scope, USER_ROLE_NAME.SUPER_ADMIN);
    const adminParams = {
      attributes: ['id', 'updatedAt', '_roleId', '_organizationId'],
      include: [User.associations._role, User.associations._organization],
    };

    return isAdminOrSuperAdmin ? adminParams : {};
  },
}))
@Table({
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
    {
      unique: true,
      fields: ['slackId'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['_roleId'],
    },
  ],
})
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.TEXT)
  declare displayName: string;

  @Unique
  @Column(DataType.TEXT)
  declare email: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare slackId: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare firebaseUserUid: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare profilePictureUrl: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @ForeignKey(() => UserRole)
  @Column(DataType.INTEGER)
  declare _roleId: number | null;

  @BelongsTo(() => UserRole, {
    foreignKey: '_roleId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  declare _role?: UserRole | null;

  @ForeignKey(() => Organization)
  @Column(DataType.INTEGER)
  declare _organizationId: number;

  @BelongsTo(() => Organization, {
    foreignKey: '_organizationId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  declare _organization?: Organization | null;

  static associations: {
    _role: Association<User, UserRole>;
    _organization: Association<User, Organization>;
  };

  isAdmin(): boolean {
    return Boolean(this._role && this._role.name === USER_ROLE_NAME.ADMIN);
  }

  isSuperAdmin(): boolean {
    return Boolean(this._role && this._role.name === USER_ROLE_NAME.SUPER_ADMIN);
  }

  isGameDev(): boolean {
    return Boolean(this._role && this._role.name === USER_ROLE_NAME.GAME_DEV);
  }
}

export function findUserById(id: number, transaction?: Transaction) {
  return User.findByPk(id, { transaction });
}

export function findUserRoleAndCapabilities(id: number, transaction?: Transaction) {
  return User.findByPk(id, {
    include: [
      {
        association: User.associations._role,
        include: [
          {
            association: UserRole.associations._capabilities,
          },
        ],
      },
    ],
    transaction,
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return User.findOne({
    where: {
      email,
    },
  });
}

export async function getUserBySlackId(slackId: string): Promise<User | null> {
  return User.findOne({
    where: {
      slackId,
    },
  });
}

export async function findAdmin() {
  return User.findOne({
    where: {
      _roleId: 4,
    },
  });
}

export async function findArenaPlayersByUserSlackId(
  slackId: string,
  transaction?: Transaction
): Promise<User | null> {
  return User.unscoped().findOne({
    attributes: ['id', 'email', 'slackId'],
    where: {
      slackId,
    },
    transaction,
  });
}

export async function findUsersBySlackIds(slackIds: string[]): Promise<User[]> {
  const users = await User.findAll({
    where: { slackId: slackIds },
  });

  if (!users || !users.length) {
    throw GameError.notFound('Users not found');
  }

  return users;
}

export async function userExists(slackId: string, transaction?: Transaction) {
  const count = await User.count({
    where: {
      slackId,
    },
    transaction,
  });

  return count > ZERO;
}

export async function upsertUser(data: UserCreationAttributes) {
  return User.upsert(data);
}

export async function createUser(data: UserCreationAttributes) {
  const {
    email,
    displayName,
    firebaseUserUid,
    slackId,
    profilePictureUrl,
    _roleId,
    _organizationId,
  } = data;
  return User.create({
    email,
    displayName,
    firebaseUserUid,
    slackId,
    profilePictureUrl,
    _roleId,
    _organizationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
