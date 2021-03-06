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

import { GAME_TYPE, ITEM_TYPE } from '../games/consts/global';

import { ArenaGame, Game, Item, User, ArenaPlayer, ArenaRoundAction } from './';

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
                  where: {
                    type: ITEM_TYPE.HEALTH_KIT,
                  },
                  required: false,
                  as: '_healthkits',
                },
                {
                  association: ArenaPlayer.associations._weapons,
                  include: [Item.associations._weapon, Item.associations._traits],
                  where: {
                    type: ITEM_TYPE.WEAPON,
                  },
                  required: false,
                  as: '_weapons',
                },
                {
                  association: ArenaPlayer.associations._armors,
                  include: [Item.associations._armor],
                  where: {
                    type: ITEM_TYPE.ARMOR,
                  },
                  required: false,
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
  declare id: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isEveryoneVisible: boolean;

  @Column(DataType.DATE)
  declare startedAt: Date;

  @Default(null)
  @Column(DataType.DATE)
  declare endedAt: Date | null;

  @ForeignKey(() => ArenaGame)
  @Column(DataType.INTEGER)
  declare _gameId: number;

  @BelongsTo(() => ArenaGame, '_gameId')
  declare _arenaGame?: ArenaGame;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare _createdById: number;

  @BelongsTo(() => User, '_createdById')
  declare _createdBy?: User;

  @HasMany(() => ArenaRoundAction, '_arenaRoundId')
  declare _actions?: ArenaRoundAction[];

  static associations: {
    _arenaGame: Association<ArenaRound, ArenaGame>;
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
          association: ArenaRound.associations._arenaGame,
          include: [
            {
              association: ArenaGame.associations._game,
              where: { isActive: true },
              include: [
                {
                  association: Game.associations._gameType,
                  attributes: ['id', 'name'],
                  where: {
                    name: GAME_TYPE.ARENA,
                  },
                },
              ],
            },
          ],
        },
        ...includeAllAssociations(includeAll),
      ],
      transaction,
    });
  }
}

//TBD this function has a bug if the api were to accept more than one Active Arena Game. It would return rounds from other ArenaGames. This can be fixed by adjusting the association to ArenaGame.

export function findActiveRound(includeAll: boolean, transaction?: Transaction) {
  return ArenaRound.findOne({
    where: { isActive: true },
    include: [
      ArenaRound.associations._createdBy,
      {
        association: ArenaRound.associations._arenaGame,
        include: [
          {
            association: ArenaGame.associations._game,
            where: { isActive: true },
            include: [
              {
                association: Game.associations._gameType,
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      },
      ...includeAllAssociations(includeAll),
    ],
    transaction,
  });
}

export async function startRound(
  _gameId: number,
  createdById: number,
  isEveryoneVisible: boolean,
  transaction: Transaction
) {
  await endActiveRound(transaction);
  return createArenaRound(
    {
      _gameId: _gameId,
      _createdById: createdById,
      isEveryoneVisible,
      isActive: true,
      startedAt: new Date(),
      endedAt: null,
    },
    transaction
  );
}
export async function endActiveRound(transaction: Transaction) {
  const activeRound = await findActiveRound(false, transaction);
  if (activeRound) {
    await activeRound.endRound(transaction);
  }
}

export async function createArenaRound(
  {
    _gameId: _gameId,
    _createdById,
    isEveryoneVisible,
    startedAt,
    endedAt,
    isActive,
  }: ArenaRoundCreationAttributes,
  transaction?: Transaction
) {
  return ArenaRound.create(
    {
      _gameId: _gameId,
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
        association: ArenaRound.associations._arenaGame,
        include: [
          {
            association: ArenaGame.associations._game,
            where: { isActive: true },
            include: [
              {
                association: Game.associations._gameType,
                attributes: ['id', 'name'],
                where: {
                  name: GAME_TYPE.ARENA,
                },
              },
            ],
          },
        ],
      },
    ],
    where: { isActive: false },
    transaction,
  });
}
