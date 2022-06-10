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
      await queryInterface.addIndex('LeaderboardResults', {
        name: 'index_user_leaderboard',
        fields: ['_userId', '_leaderboardEntryId'],
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('LeaderboardResultsMeta', {
        name: 'index_attribute_leaderboardresult',
        fields: ['attribute', '_leaderboardResultsId'],
        unique: true,
        transaction,
      });
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex('LeaderboardResults', 'index_user_leaderboard', {
        transaction,
      });

      await queryInterface.removeIndex(
        'LeaderboardResultsMeta',
        'index_attribute_leaderboardresult',
        { transaction }
      );
    });
  },
};
