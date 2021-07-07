import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Default,
  BelongsTo,
  HasMany,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';

import {
  Game,
  ArenaPlayer,
  ItemHealthKit,
  ItemArmor,
  ItemWeapon,
  ArenaRoundAction,
  User,
} from './';

interface ArenaRoundAttributes {
  id: number;
  _gameId: number;
  _createdById: number;
  isActive: boolean;
  isEveryoneVisible: boolean;
  startedAt: Date;
  endedAt: Date | null;
}

interface ArenaRoundCreationAttributes {
  _gameId: number;
  _createdById: number;
  isEveryoneVisible: boolean;
  startedAt: Date;
  isActive: boolean;
  endedAt: Date | null;
}

@Table
export class ArenaRound
  extends Model<ArenaRoundAttributes, ArenaRoundCreationAttributes>
  implements ArenaRoundAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isEveryoneVisible!: boolean;

  @Column(DataType.DATE)
  startedAt!: Date;

  @Default(null)
  @Column(DataType.DATE)
  endedAt!: Date | null;

  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  _gameId!: number;

  @BelongsTo(() => Game, '_gameId')
  _game?: Game;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _createdById!: number;

  @BelongsTo(() => User, '_createdById')
  _createdBy?: User;

  @HasMany(() => ArenaRoundAction, '_arenaRoundId')
  _actions?: ArenaRoundAction[];

  static associations: {
    _game: Association<ArenaRound, Game>;
    _createdBy: Association<ArenaRound, User>;
    _actions: Association<ArenaRound, ArenaRoundAction>;
  };

  makeEveryoneVisible(transaction: Transaction) {
    return this.update({ isEveryoneVisible: true }, { transaction });
  }

  endRound(transaction: Transaction) {
    return this.update(
      {
        isActive: false,
        endedAt: new Date(),
      },
      { transaction }
    );
  }

  async customReload(includeAll: boolean, transaction?: Transaction) {
    return this.reload({
      include: [
        User,
        {
          model: Game,
          where: { isActive: true },
        },
        ...(includeAll
          ? [
              {
                model: ArenaRoundAction,
                include: [
                  {
                    model: ArenaPlayer,
                    include: [User, ItemHealthKit, ItemArmor, ItemWeapon],
                  },
                ],
              },
            ]
          : []),
      ],
      transaction,
    });
  }
}

export async function findOneRound(
  roundId: number,
  includeAll: boolean,
  transaction?: Transaction
) {
  return ArenaRound.findOne({
    where: { id: roundId },
    include: [
      User,
      {
        model: Game,
        where: { isActive: true },
      },
      ...(includeAll
        ? [
            {
              model: ArenaRoundAction,
              include: [
                {
                  model: ArenaPlayer,
                  include: [User, ItemHealthKit, ItemArmor, ItemWeapon],
                },
              ],
            },
          ]
        : []),
    ],
    transaction,
  });
}

export async function findActiveRound(includeAll: boolean, transaction?: Transaction) {
  return ArenaRound.findOne({
    where: { isActive: true },
    include: [
      User,
      {
        model: Game,
        where: { isActive: true },
      },
      ...(includeAll
        ? [
            {
              model: ArenaRoundAction,
              include: [
                {
                  model: ArenaPlayer,
                  include: [User, ItemHealthKit, ItemArmor, ItemWeapon],
                },
              ],
            },
          ]
        : []),
    ],
    transaction,
  });
}

export async function startRound(
  gameId: number,
  createdById: number,
  isEveryoneVisible: boolean,
  transaction: Transaction
) {
  const activeRound = await findActiveRound(false, transaction);
  if (activeRound) {
    await activeRound.endRound(transaction);
  }
  return createArenaRound(
    {
      _gameId: gameId,
      _createdById: createdById,
      isEveryoneVisible,
      isActive: true,
      startedAt: new Date(),
      endedAt: null,
    },
    transaction
  );
}

export async function createArenaRound(
  {
    _gameId,
    _createdById,
    isEveryoneVisible,
    startedAt,
    endedAt,
    isActive,
  }: ArenaRoundCreationAttributes,
  transaction: Transaction
) {
  return ArenaRound.create(
    {
      _gameId,
      _createdById,
      isEveryoneVisible,
      startedAt,
      endedAt,
      isActive,
    },
    { transaction }
  );
}

export function countRoundsCompleted(transaction?: Transaction) {
  return ArenaRound.count({
    include: [
      {
        model: Game,
        where: { isActive: true },
      },
    ],
    where: { isActive: false },
    transaction,
  });
}
