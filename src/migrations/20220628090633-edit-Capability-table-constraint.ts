import { DataTypes } from 'sequelize';
import type { QueryInterface, Sequelize } from 'sequelize';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}
module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'Capability',
        'name',
        {
          allowNull: false,
          type: DataTypes.TEXT,
          unique: true,
        },
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'Capability',
        'name',
        {
          allowNull: false,
          type: DataTypes.TEXT,
          unique: false,
        },
        { transaction }
      );
    });
  },
};
