import { Association, Op, Transaction } from 'sequelize';
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
import { DEFAULT_COIN_PRIZE, DEFAULT_LUNA_PRIZE, MAX_FLOOR_NUMBER } from '../games/tower/consts';
import { Game, User, TowerStatistics, TowerFloor, TowerRaider } from '.';
import { findActiveGame, findLastActiveGame, startGame } from './Game';
import { GAME_TYPE } from '../games/consts/global';
import { addTowerFloors } from './TowerFloor';

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
  id!: number;

  @Column(DataType.INTEGER)
  lunaPrize!: number;

  @Default(MAX_FLOOR_NUMBER)
  @Column(DataType.INTEGER)
  height!: number;

  @Column(DataType.INTEGER)
  coinPrize!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isOpen!: boolean;

  @Unique
  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  _gameId!: number;

  @BelongsTo(() => Game, {
    foreignKey: '_gameId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _game?: Game;

  @HasMany(() => TowerFloor, '_gameId')
  _floors?: TowerFloor[];

  @HasMany(() => TowerStatistics, '_gameId')
  _statistics?: TowerStatistics[];

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

  async findAllRaidersInsideActiveTower(transaction?: Transaction) {
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

  async openOrCloseTowerGame(isOpen: boolean, transaction: Transaction) {
    await this.update(
      {
        isOpen,
      },
      { transaction }
    );
    return this.get({ plain: true });
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
  const newGame = await startGame(
    { name, _createdById, _gameTypeId: GAME_TYPE.TOWER, startedAt: new Date() },
    transaction
  );
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
  await addTowerFloors(game, transaction);
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
