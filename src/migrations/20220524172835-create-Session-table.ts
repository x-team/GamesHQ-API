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
        'Session',
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
          },
          _userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
              model: 'User',
              key: 'id',
            },
          },
          token: {
            allowNull: false,
            type: DataTypes.TEXT,
          },
          expireTime: {
            allowNull: false,
            type: DataTypes.DOUBLE,
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
      await queryInterface.dropTable('Session', { transaction });
    });
  },
};
