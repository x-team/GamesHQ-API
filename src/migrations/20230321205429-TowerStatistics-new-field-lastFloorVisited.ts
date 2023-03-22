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
      await queryInterface.addColumn(
        'TowerStatistics',
        'lastFloorVisited',
        {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('TowerStatistics', 'lastFloorVisited', { transaction });
    });
  },
};
