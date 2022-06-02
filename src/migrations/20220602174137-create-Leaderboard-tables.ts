import type { QueryInterface, Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'LeaderboardEntry',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
          },
          _gameTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'GameType',
              key: 'id',
            },
          },
          name: {
            allowNull: false,
            type: DataTypes.TEXT,
          },
          scoreStrategy: {
            allowNull: false,
            type: DataTypes.ENUM('highest', 'lowest', 'sum', 'latest'),
            defaultValue: 'highest',
          },
          resetStrategy: {
            allowNull: false,
            type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'never'),
            defaultValue: 'never',
          },
          createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
          },
        },
        { transaction }
      );

      await queryInterface.createTable(
        'LeaderboardResults',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
          },
          _leaderboardEntryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'LeaderboardEntry',
              key: 'id',
            },
          },
          _userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'User',
              key: 'id',
            },
          },
          score: {
            allowNull: false,
            type: DataTypes.INTEGER,
          },
          meta: {
            allowNull: true,
            type: DataTypes.JSON, //perhaps a LeaderboardResults table?
          },
          createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
          },
        },
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('LeaderboardResults', { transaction });
      await queryInterface.dropTable('LeaderboardEntry', { transaction });
    });
  },
};
