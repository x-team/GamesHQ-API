import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

import { GAME_TYPE } from '../games/consts/global';

interface GameTypeAttributes {
  id: GAME_TYPE;
}

interface GameTypeCreationAttributes {
  id: GAME_TYPE;
}

@Table
export class GameType
  extends Model<GameTypeAttributes, GameTypeCreationAttributes>
  implements GameTypeAttributes
{
  @PrimaryKey
  @Column(DataType.TEXT)
  id!: GAME_TYPE;
}
