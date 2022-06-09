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
        'LeaderboardResultsMeta',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
          },
          _leaderboardResultsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'LeaderboardResults',
              key: 'id',
            },
          },
          attribute: {
            allowNull: false,
            type: DataTypes.TEXT,
          },
          value: {
            allowNull: false,
            type: DataTypes.TEXT,
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

      await queryInterface.removeColumn('LeaderboardResults', 'meta', {
        transaction,
      });
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('LeaderboardResultsMeta', { transaction });
      await queryInterface.addColumn(
        'LeaderboardResults',
        'meta',
        {
          allowNull: true,
          type: DataTypes.JSON,
        },
        {
          transaction,
        }
      );
    });
  },
};
