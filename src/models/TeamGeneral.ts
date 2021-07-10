import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from 'sequelize-typescript';

import { Team, User } from './';

interface TeamGeneralAttributes {
  _teamId: number;
  _userId: number;
}

interface TeamGeneralCreationAttributes {
  _teamId: number;
  _userId: number;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['_teamId', '_userId'],
    },
  ],
})
export class TeamGeneral
  extends Model<TeamGeneralAttributes, TeamGeneralCreationAttributes>
  implements TeamGeneralAttributes
{
  @PrimaryKey
  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  _teamId!: number;

  @BelongsTo(() => Team, {
    foreignKey: '_teamId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _team?: Team;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _userId!: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _user?: User;

  static associations: {
    _user: Association<TeamGeneral, User>;
    _team: Association<TeamGeneral, Team>;
  };
}

interface AddOrRemoveGeneral {
  userId: number;
  teamId: number;
  operation: 'add' | 'remove';
  transaction: Transaction;
}

export function findTeamByGeneral(userId: number, transaction: Transaction) {
  return TeamGeneral.findAll({
    where: {
      _userId: userId,
    },
    transaction,
  });
}

export function addOrRemoveGeneralTeam({
  userId,
  teamId,
  operation,
  transaction,
}: AddOrRemoveGeneral) {
  return operation === 'add'
    ? TeamGeneral.create(
        {
          _userId: userId,
          _teamId: teamId,
        },
        { transaction }
      )
    : TeamGeneral.destroy({
        where: {
          _userId: userId,
          _teamId: teamId,
        },
        transaction,
      });
}

export async function isTeamGeneral(teamId: number, userId: number, transaction?: Transaction) {
  const teamGeneral = await TeamGeneral.findOne({
    where: {
      _userId: userId,
      _teamId: teamId,
    },
    transaction,
  });
  return !!teamGeneral;
}
