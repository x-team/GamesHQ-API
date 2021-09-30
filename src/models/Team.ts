import type { Association, FindOptions, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsToMany,
  Scopes,
  DefaultScope,
  Unique,
  Default,
  AllowNull,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';

import { USER_ROLE_NAME } from '../consts/model';
import { isScopeRole } from '../utils/permissions';

import {
  User,
  TeamGeneral,
  // Legend,
} from './';
import { Organization } from './Organization';

interface TeamAttributes {
  id: number;
  name: string;
  emoji: string | null;
  slackWebhook: string | null;
  health: number;
  isActive: boolean;
  addedAt: Date;
}

interface TeamCreationAttributes {
  name: string;
  emoji?: string;
  slackWebhook?: string;
  health: number;
  isActive: boolean;
  addedAt: Date;
}

function withSensitiveData(): FindOptions {
  return {
    include: [
      {
        association: Team.associations._members,
        as: '_members',
        required: false,
      },
    ],
  };
}

@DefaultScope(() => ({
  attributes: ['id', 'name', 'emoji', 'isActive', 'slackWebhook', 'health', 'addedAt'],
}))
@Scopes(() => ({
  withSensitiveData,
  forRole(scope: string[]) {
    if (
      isScopeRole(scope, USER_ROLE_NAME.SUPER_ADMIN) ||
      isScopeRole(scope, USER_ROLE_NAME.ADMIN) ||
      isScopeRole(scope, USER_ROLE_NAME.COMMUNITY_TEAM)
    ) {
      return withSensitiveData();
    }
    return {};
  },
}))
@Table({
  indexes: [
    {
      fields: ['name'],
    },
  ],
})
export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Unique
  @Column(DataType.TEXT)
  name!: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.TEXT)
  emoji!: string | null;

  @Default(new Date())
  @Column(DataType.DATE)
  addedAt!: Date;

  @Column(DataType.INTEGER)
  health!: number;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.TEXT)
  slackWebhook!: string | null;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @ForeignKey(() => Organization)
  @Column(DataType.INTEGER)
  _organizationId!: number;

  @HasMany(() => User, {
    foreignKey: '_teamId',
    as: '_members',
  })
  _members?: User[];

  @BelongsToMany(() => User, {
    through: () => TeamGeneral,
    foreignKey: '_teamId',
    otherKey: '_userId',
    as: '_generals',
  })
  _generals?: User[];

  @BelongsTo(() => Organization, {
    foreignKey: '_organizationId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: '_organization',
  })
  _organization?: Organization;

  // @HasMany(() => Legend, { foreignKey: '_teamId' })
  // _legends?: Legend[];

  static associations: {
    _members: Association<Team, User>;
    _generals: Association<Team, User>;
    _organization: Association<Team, Organization>;
  };
}

// TODO: CRUD with scope implementation

export function findActiveTeams(transaction?: Transaction) {
  return Team.findAll({
    where: { isActive: true },
    include: [
      { association: Team.associations._members, as: '_members' },
      { association: Team.associations._generals, as: '_generals' },
    ],
    transaction,
  });
}

export function findTeamById(teamId: number, transaction?: Transaction) {
  return Team.findByPk(teamId, {
    include: [
      { association: Team.associations._members, as: '_members' },
      { association: Team.associations._generals, as: '_generals' },
    ],
    transaction,
  });
}

export function findTeamByName(teamName: string, transaction?: Transaction) {
  return Team.findOne({
    where: { name: teamName },
    include: [
      { association: Team.associations._members, as: '_members' },
      { association: Team.associations._generals, as: '_generals' },
    ],
    transaction,
  });
}

export function findActiveTeamByName(name: string, transaction?: Transaction) {
  return Team.findOne({
    where: { isActive: true, name },
    include: [
      { association: Team.associations._members, as: '_members' },
      { association: Team.associations._generals, as: '_generals' },
    ],
    transaction,
  });
}
