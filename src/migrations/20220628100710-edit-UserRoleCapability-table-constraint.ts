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
      await queryInterface.removeConstraint(
        'UserRoleCapability',
        '"UserRoleCapability__capabilityId_fkey'
      );
      await queryInterface.removeConstraint(
        'UserRoleCapability',
        '"UserRoleCapability__userRoleId_fkey'
      );

      await queryInterface.changeColumn(
        'UserRoleCapability',
        '_userRoleId',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'UserRole',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        'UserRoleCapability',
        '_capabilityId',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Capability',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint(
        'UserRoleCapability',
        '"UserRoleCapability__capabilityId_fkey'
      );
      await queryInterface.removeConstraint(
        'UserRoleCapability',
        '"UserRoleCapability__userRoleId_fkey'
      );

      await queryInterface.changeColumn(
        'UserRoleCapability',
        '_userRoleId',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'UserRole',
            key: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT',
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        'UserRoleCapability',
        '_capabilityId',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Capability',
            key: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT',
        },
        { transaction }
      );
    });
  },
};
