import { Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';

import { GAME_TYPE } from '../games/consts/global';
import { User } from './';

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

  @AllowNull(false)
  @Column(DataType.TEXT)
  clientSecret!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  signingSecret!: string;

  @BelongsTo(() => User, {
    foreignKey: '_createdById',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _createdBy?: User;

  static associations: {
    _createdBy: Association<GameType, User>;
  };
}
