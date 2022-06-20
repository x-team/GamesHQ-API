import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  BelongsTo,
  AllowNull,
  ForeignKey,
  AutoIncrement,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

import { ZERO } from '../games/consts/global';

import { GameType } from './';

interface AchievementAttributes {
  id: number;
  _gameTypeId: number;
  description: string;
  isEnabled: boolean;
  targetValue: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AchievementCreationAttributes {
  id?: number;
  description: string;
  isEnabled: boolean;
  targetValue: number;
  createdAt?: Date;
  updatedAt?: Date;
  _gameTypeId: number;
}

@Table
export class Achievement
  extends Model<AchievementAttributes, AchievementCreationAttributes>
  implements AchievementAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isEnabled: boolean;

  @AllowNull(false)
  @Default(ZERO)
  @Column(DataType.INTEGER)
  declare targetValue: number;

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  @ForeignKey(() => GameType)
  @Column(DataType.INTEGER)
  declare _gameTypeId: number;

  @BelongsTo(() => GameType, {
    foreignKey: '_gameTypeId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _gameType?: GameType;

  static associations: {
    _gameType: Association<Achievement, GameType>;
  };
}

export interface AchievementEditorData {
  id?: number;
  description: string;
  isEnabled: boolean;
  targetValue: number;
}

export function findAchievementById(id: number, transaction?: Transaction) {
  return Achievement.findByPk(id, { transaction });
}

export function findAllAchievementsByGameType(gameTypeId: number, transaction?: Transaction) {
  return Achievement.findAll({ where: { _gameTypeId: gameTypeId }, transaction });
}

export function getAchievementByCreator(
  id: number,
  _gameTypeId: number,
  _createdById: number,
  transaction?: Transaction
) {
  return Achievement.findOne({
    where: {
      id,
      _gameTypeId,
    },
    include: [
      {
        association: Achievement.associations._gameType,
        attributes: [],
        where: {
          _createdById,
        },
      },
    ],
    transaction,
  });
}

export async function createOrUpdateAchievement(
  achievementData: AchievementEditorData,
  gameTypeId: number,
  transaction?: Transaction
) {
  return Achievement.upsert(
    {
      ...achievementData,
      _gameTypeId: gameTypeId,
    },
    { transaction }
  );
}

export function deleteAchievementById(id: number, transaction?: Transaction) {
  return Achievement.destroy({
    where: {
      id,
    },
    transaction,
  });
}
