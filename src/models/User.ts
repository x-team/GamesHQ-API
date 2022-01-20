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
  slackId: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
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
  id!: number;

  @Column(DataType.TEXT)
  displayName!: string;

  @Unique
  @Column(DataType.TEXT)
  email!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  slackId!: string | null;

  @AllowNull(false)
  @Column(DataType.TEXT)
  firebaseUserUid!: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  profilePictureUrl!: string | null;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @ForeignKey(() => UserRole)
  @Column(DataType.INTEGER)
  _roleId!: number | null;

  @BelongsTo(() => UserRole, {
    foreignKey: '_roleId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  _role?: UserRole | null;

  @ForeignKey(() => Organization)
  @Column(DataType.INTEGER)
  _organizationId!: number;

  @BelongsTo(() => Organization, {
    foreignKey: '_organizationId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  _organization?: Organization | null;

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

  isCommunityTeam(): boolean {
    return Boolean(this._role && this._role.name === USER_ROLE_NAME.COMMUNITY_TEAM);
  }
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

export async function createUser(data: UserCreationAttributes) {
  const {
    email,
    displayName,
    firebaseUserUid,
    slackId,
    profilePictureUrl,
    _roleId,
    _teamId,
    _organizationId,
  } = data;
  await User.create({
    email,
    displayName,
    firebaseUserUid,
    slackId,
    profilePictureUrl,
    _roleId,
    _teamId,
    _organizationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
