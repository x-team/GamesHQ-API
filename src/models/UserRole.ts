import type { Association } from 'sequelize';
import { Table, Column, Model, DataType, HasMany, Unique, PrimaryKey } from 'sequelize-typescript';

import { USER_ROLE_LEVEL, USER_ROLE_NAME } from '../consts/model';

import { User } from './';

interface UserRoleAttributes {
  id: USER_ROLE_LEVEL;
  name: USER_ROLE_NAME;
}

interface UserRoleCreationAttributes {
  id: USER_ROLE_LEVEL;
  name: USER_ROLE_NAME;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['name'],
    },
  ],
})
export class UserRole
  extends Model<UserRoleAttributes, UserRoleCreationAttributes>
  implements UserRoleAttributes
{
  @PrimaryKey
  @Unique
  @Column(DataType.INTEGER)
  declare id: USER_ROLE_LEVEL;

  @Unique
  @Column(DataType.TEXT)
  declare name: USER_ROLE_NAME;

  @HasMany(() => User, '_roleId')
  _users?: User[];

  static associations: {
    _users: Association<UserRole, User>;
  };
}
