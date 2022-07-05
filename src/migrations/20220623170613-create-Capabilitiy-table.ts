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
      await queryInterface.createTable(
        'Capability',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
          },
          name: {
            allowNull: false,
            type: DataTypes.TEXT,
          },
        },
        { transaction }
      );

      await queryInterface.createTable(
        'UserRoleCapability',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
          },
          _userRoleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'UserRole',
              key: 'id',
            },
          },
          _capabilityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'Capability',
              key: 'id',
            },
          },
        },
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('UserRoleCapability', { transaction });
      await queryInterface.dropTable('Capability', { transaction });
    });
  },
};
