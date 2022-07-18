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
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

import { ZERO } from '../games/consts/global';

import { User, Achievement } from './';

interface AchievementUnlockedAttributes {
  isUnlocked: boolean;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  _userId: number;
  _achievementId: number;
}
export interface AchievementUnlockedCreationAttributes {
  progress?: number;
  _achievementId: number;
  _userId: number;
  isUnlocked: boolean;
}

@Table
export class AchievementUnlocked
  extends Model<AchievementUnlockedAttributes, AchievementUnlockedCreationAttributes>
  implements AchievementUnlockedAttributes
{
  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare _userId: number;

  @PrimaryKey
  @ForeignKey(() => Achievement)
  @Column(DataType.INTEGER)
  declare _achievementId: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isUnlocked: boolean;

  @AllowNull(false)
  @Default(ZERO)
  @Column(DataType.INTEGER)
  declare progress: number;

  @AllowNull(false)
  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @AllowNull(false)
  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _user?: User;

  @BelongsTo(() => Achievement, {
    foreignKey: '_achievementId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _achievement?: Achievement;

  static associations: {
    _user: Association<AchievementUnlocked, User>;
    _achievement: Association<AchievementUnlocked, Achievement>;
  };
}
export interface AchievementUnlockedUnlockedEditorData {
  _userId: number;
  _achievementId: number;
  isUnlocked: boolean;
  progress: number;
}

export async function createOrUpdateAchievementUnlocked(
  achievementUnlockedData: AchievementUnlockedUnlockedEditorData
) {
  return await AchievementUnlocked.upsert({ ...achievementUnlockedData });
}

export async function findAchievementUnlocked(_userId: number, _achievementId: number) {
  return await AchievementUnlocked.findOne({ where: { _userId, _achievementId } });
}

export function deleteAchievementUnlocked(_userId: number, _achievementId: number) {
  return AchievementUnlocked.destroy({
    where: {
      _userId,
      _achievementId,
    },
  });
}

export function getAchievementUnlockedFromAchievement(
  achievement: Achievement,
  transaction?: Transaction
) {
  return AchievementUnlocked.findAll({
    where: {
      _achievementId: achievement.id,
    },
    include: [
      {
        association: AchievementUnlocked.associations._user,
        attributes: ['email'],
      },
    ],
    attributes: ['progress', '_user.email'],
    transaction,
  });
}
