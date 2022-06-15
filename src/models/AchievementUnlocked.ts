import { Association, Transaction } from 'sequelize';
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
interface AchievementUnlockedCreationAttributes {
  isUnlocked: boolean;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  _userId: number;
  _achievementId: number;
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
  _user?: User;

  @BelongsTo(() => Achievement, {
    foreignKey: '_achievementId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _achievement?: Achievement;

  static associations: {
    _user: Association<AchievementUnlocked, User>;
    _achievement: Association<AchievementUnlocked, Achievement>;
  };
}
interface AchievementUnlockedId {
  _userId: number;
  _achievementId: number;
}

interface AchievementUnlockedUnlockedEditorData {
  id: AchievementUnlockedId;
  isUnlocked: boolean;
  progress: number;
  createdAt: Date;
}

export function findAchievementUnlockedById(
  { _userId, _achievementId }: AchievementUnlockedId,
  transaction?: Transaction
) {
  return AchievementUnlocked.findOne({ where: { _userId, _achievementId }, transaction });
}

export function findAllAchievementUnlockedsByUser(userId: number, transaction?: Transaction) {
  return AchievementUnlocked.findAll({ where: { _userId: userId }, transaction });
}

export function findAllAchievementUnlockedsByAchievement(
  achievementId: number,
  transaction?: Transaction
) {
  return AchievementUnlocked.findAll({ where: { _achievementId: achievementId }, transaction });
}

interface PatchAchievementUnlocked {
  id: AchievementUnlockedId;
  isUnlocked: boolean;
}

export async function patchAchievementUnlocked(
  patchAchievementUnlocked: PatchAchievementUnlocked,
  transaction?: Transaction
) {
  const {
    id: { _achievementId, _userId },
    isUnlocked,
  } = patchAchievementUnlocked;
  return AchievementUnlocked.update(
    { isUnlocked },
    { where: { _achievementId, _userId }, transaction }
  );
}

export async function createOrUpdateAchievementUnlocked(
  achievementUnlockedData: AchievementUnlockedUnlockedEditorData,
  transaction?: Transaction
) {
  const {
    id: { _achievementId, _userId },
    isUnlocked,
    progress,
    createdAt,
  } = achievementUnlockedData;
  const valuesToUpdate: AchievementUnlockedCreationAttributes = {
    _achievementId,
    _userId,
    isUnlocked,
    progress,
    createdAt: createdAt ?? new Date(),
    updatedAt: new Date(),
  };

  return AchievementUnlocked.upsert(valuesToUpdate, { transaction });
}

export function deleteAchievementUnlockedById(
  { _userId, _achievementId }: AchievementUnlockedId,
  transaction?: Transaction
) {
  return AchievementUnlocked.destroy({
    where: { _userId, _achievementId },
    transaction,
  });
}
