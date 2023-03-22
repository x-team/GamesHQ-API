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
        'lastHealth',
        {
          type: DataTypes.INTEGER,
          defaultValue: 100,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'TowerStatistics',
        'perks',
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
      await queryInterface.removeColumn('TowerStatistics', 'lastHealth', { transaction });
      await queryInterface.removeColumn('TowerStatistics', 'perks', { transaction });
    });
  },
};
