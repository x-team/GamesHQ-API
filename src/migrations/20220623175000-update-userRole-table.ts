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
      await queryInterface.bulkUpdate(
        'UserRole',
        { name: 'gamedev' },
        { name: 'community team' },
        { transaction }
      );

      await queryInterface.bulkUpdate(
        'UserRole',
        { name: 'super_admin' },
        { name: 'super admin' },
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkUpdate(
        'UserRole',
        { name: 'super admin' },
        { name: 'super_admin' },
        { transaction }
      );

      await queryInterface.bulkUpdate(
        'UserRole',
        { name: 'community team' },
        { name: 'gamedev' },
        { transaction }
      );
    });
  },
};
