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

import { Game, Item, User, ArenaPlayer, ArenaRoundAction } from './';

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

function includeAllAssociations(includeAll: boolean) {
  return includeAll
    ? [
        {
          association: ArenaRound.associations._actions,
          include: [
            {
              association: ArenaRoundAction.associations._player,
              include: [
                ArenaPlayer.associations._user,
                {
                  association: ArenaPlayer.associations._healthkits,
                  include: [Item.associations._healthkit],
                  as: '_healthkits',
                },
                {
                  association: ArenaPlayer.associations._weapons,
                  include: [Item.associations._weapon, Item.associations._traits],
                  as: '_weapons',
                },
                {
                  association: ArenaPlayer.associations._armors,
                  include: [Item.associations._armor],
                  as: '_armors',
                },
              ],
            },
          ],
        },
      ]
    : [];
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
        ArenaRound.associations._createdBy,
        {
          association: ArenaRound.associations._game,
          where: { isActive: true },
        },
        ...includeAllAssociations(includeAll),
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
      ArenaRound.associations._createdBy,
      {
        association: ArenaRound.associations._game,
        where: { isActive: true },
      },
      ...includeAllAssociations(includeAll),
    ],
    transaction,
  });
}

export function findActiveRound(includeAll: boolean, transaction?: Transaction) {
  return ArenaRound.findOne({
    where: { isActive: true },
    include: [
      ArenaRound.associations._createdBy,
      {
        association: ArenaRound.associations._game,
        where: { isActive: true },
      },
      ...includeAllAssociations(includeAll),
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
        association: ArenaRound.associations._game,
        where: { isActive: true },
      },
    ],
    where: { isActive: false },
    transaction,
  });
}
