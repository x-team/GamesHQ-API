import type { Association, Transaction } from 'sequelize';
import { Op } from 'sequelize';
// import { Op } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  Default,
  BelongsTo,
  HasMany,
  AutoIncrement,
  PrimaryKey,
  Unique,
} from 'sequelize-typescript';

import { GAME_TYPE } from '../games/consts/global';
import {
  DEFAULT_COIN_PRIZE,
  DEFAULT_LUNA_PRIZE,
  DEFAULT_MAX_FLOOR_NUMBER,
} from '../games/tower/consts';

import { findActiveGame, findLastActiveGame, startGame } from './Game';
import { addTowerFloors } from './TowerFloor';

import { Game, User, TowerStatistics, TowerFloor, TowerRaider } from '.';

interface TowerGameAttributes {
  id: number;
  lunaPrize: number;
  coinPrize: number;
  height: number;
  isOpen: boolean;
  _gameId: number;
}

interface TowerGameCreationAttributes {
  lunaPrize?: number;
  coinPrize?: number;
  height?: number;
  isOpen: boolean;
  _gameId: number;
}

@Table({
  indexes: [
    {
      fields: ['isOpen'],
    },
  ],
})
export class TowerGame
  extends Model<TowerGameAttributes, TowerGameCreationAttributes>
  implements TowerGameAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.INTEGER)
  declare lunaPrize: number;

  @Default(DEFAULT_MAX_FLOOR_NUMBER)
  @Column(DataType.INTEGER)
  declare height: number;

  @Column(DataType.INTEGER)
  declare coinPrize: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isOpen: boolean;

  @Unique
  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  declare _gameId: number;

  @BelongsTo(() => Game, {
    foreignKey: '_gameId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  declare _game?: Game;

  @HasMany(() => TowerFloor, '_towerGameId')
  declare _floors?: TowerFloor[];

  @HasMany(() => TowerStatistics, '_towerGameId')
  declare _statistics?: TowerStatistics[];

  static associations: {
    _game: Association<TowerGame, Game>;
    _floors: Association<TowerGame, TowerFloor>;
    _statistics: Association<TowerGame, TowerStatistics>;
  };

  findRaiderInTower(raider: TowerRaider) {
    return this._floors?.find(
      (floor) => floor.id === raider._currentTowerFloorBattlefield?._towerFloorId
    );
  }

  async findAllRaidersInside(transaction?: Transaction) {
    await this.reload({
      include: [
        {
          association: TowerGame.associations._floors,
          order: [['number', 'ASC']],
          include: [{ association: TowerFloor.associations._floorBattlefields }],
        },
      ],
      transaction,
    });
    const towerFloorBattlefields: Set<number> = new Set();
    this._floors?.map((floor) => {
      floor._floorBattlefields?.map((battlefield) => {
        towerFloorBattlefields.add(battlefield.id);
      });
    });
    return TowerRaider.findAll({
      where: {
        _towerFloorBattlefieldId: {
          [Op.in]: Array.from(towerFloorBattlefields),
        },
      },
      transaction,
    });
  }

  async openOrCloseGates(isOpen: boolean, transaction: Transaction) {
    return this.update(
      {
        isOpen,
      },
      { transaction }
    );
  }

  async updateTowerGame(
    { lunaPrize, coinPrize }: Partial<TowerGameAttributes>,
    transaction: Transaction
  ) {
    await this.update(
      {
        lunaPrize,
        coinPrize,
      },
      { transaction }
    );
    return this.get({ plain: true });
  }
}

const basicUserInfo = ['id', 'displayName', 'slackId', 'email'];

export async function findActiveTowerGame(transaction?: Transaction) {
  return findActiveGame(GAME_TYPE.TOWER, transaction);
}

export async function findLastActiveTowerGame(transaction?: Transaction) {
  return findLastActiveGame(GAME_TYPE.TOWER, transaction);
}

export async function startTowerGame(
  {
    name,
    _createdById,
    lunaPrize = DEFAULT_LUNA_PRIZE,
    coinPrize = DEFAULT_COIN_PRIZE,
    height,
    isOpen = false,
  }: {
    name: string;
    _createdById: number;
    lunaPrize?: number;
    coinPrize?: number;
    height?: number;
    isOpen: boolean;
  },
  transaction: Transaction
) {
  const newGame = await startGame(GAME_TYPE.TOWER, name, _createdById, new Date(), transaction);

  return createTowerGame(
    newGame,
    { lunaPrize, coinPrize, height, isOpen, _gameId: newGame.id },
    transaction
  );
}

export async function createTowerGame(
  game: Game,
  { lunaPrize, coinPrize, height, isOpen }: TowerGameCreationAttributes,
  transaction: Transaction
) {
  const newTowerGame = TowerGame.build({
    _gameId: game.id,
    height,
    lunaPrize: lunaPrize ?? DEFAULT_LUNA_PRIZE,
    coinPrize: coinPrize ?? DEFAULT_COIN_PRIZE,
    isOpen,
  });
  await newTowerGame.save({ transaction });
  await addTowerFloors(newTowerGame, transaction);
  return game.reload({
    include: [
      {
        model: User.unscoped(),
        attributes: basicUserInfo,
      },
      {
        association: Game.associations._tower,
        include: [{ association: TowerGame.associations._floors }],
      },
    ],
    transaction,
  });
}
