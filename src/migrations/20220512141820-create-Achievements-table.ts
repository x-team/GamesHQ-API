import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

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
        'Achievement',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
          },
          _gameTypeId: {
            type: DataTypes.TEXT,
            allowNull: false,
            references: {
              model: 'GameType',
              key: 'id',
            },
          },
          description: {
            allowNull: false,
            type: DataTypes.TEXT,
          },
          isEnabled: {
            allowNull: false,
            defaultValue: true,
            type: DataTypes.BOOLEAN,
          },
          targetValue: {
            allowNull: false,
            defaultValue: 0,
            type: DataTypes.INTEGER,
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
        'AchievementUnlocked',
        {
          _userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'User',
              key: 'id',
            },
          },
          _achievementId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'Achievement',
              key: 'id',
            },
          },
          isUnlocked: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN,
          },
          progress: {
            allowNull: false,
            defaultValue: 0,
            type: DataTypes.INTEGER,
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
      await queryInterface.dropTable('Achievement', { transaction });
      await queryInterface.dropTable('AchievementUnlocked', { transaction });
    });
  },
};
