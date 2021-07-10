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
import { isScopeRole } from '../utils/permissions';

import {
  Team,
  UserRole,
  Organization,
  // Legend,
} from './';

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
  _teamId: number | null;
}

interface UserCreationAttributes {
  slackId: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  displayName: string;
  profilePictureUrl: string | null;
  _roleId: number | null;
  _organizationId: number;
  _teamId: number | null;
}

@DefaultScope(() => ({
  attributes: ['id', 'email', 'slackId', 'createdAt', 'displayName', 'profilePictureUrl'],
  include: [Team],
}))
@Scopes(() => ({
  forRole(scope: string[]) {
    const isAdminOrSuperAdmin =
      isScopeRole(scope, USER_ROLE_NAME.ADMIN) || isScopeRole(scope, USER_ROLE_NAME.SUPER_ADMIN);
    const adminParams = {
      attributes: ['id', 'updatedAt', '_roleId', '_organizationId'],
      include: [Team, UserRole, Organization],
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
    {
      fields: ['_teamId'],
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

  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  _teamId!: number | null;

  @BelongsTo(() => Team, {
    foreignKey: '_teamId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  _team?: Team | null;

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
    _team: Association<User, Team>;
    _organization: Association<User, Organization>;
  };
}

export async function getUserBySlackId(slackId: string): Promise<User> {
  const user = await User.findOne({
    where: {
      slackId,
    },
  });
  if (!user) {
    throw Error(`User with slack ID: ${slackId} not found`);
  }
  return user;
}

export async function findArenaUserBySlackId(
  slackId: string,
  transaction?: Transaction
): Promise<User | null> {
  return User.unscoped().findOne({
    attributes: ['id', 'email', 'slackId', '_teamId'],
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
    throw Error('Users not found');
  }

  return users;
}

export async function setTeamToUser(user: User, team: Team, transaction: Transaction) {
  // @ts-ignore
  return user.$set('_team', team, { save: true, transaction });
}

export function isUserAdmin(user: User): boolean {
  return Boolean(user._role && user._role.name === USER_ROLE_NAME.ADMIN);
}

export function isUserSuperAdmin(user: User): boolean {
  return Boolean(user._role && user._role.name === USER_ROLE_NAME.SUPER_ADMIN);
}

export function isUserCommunityTeam(user: User): boolean {
  return Boolean(user._role && user._role.name === USER_ROLE_NAME.COMMUNITY_TEAM);
}
