import { DataTypes, QueryInterface, QueryTypes, Sequelize, Transaction } from 'sequelize';
import { generateSecret } from '../utils/cryptography';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

interface LightEntity {
  id: number;
}

const firstUserEmail = 'cristian.cmj@x-team.com';

function queryByProp(
  table: string,
  prop: string,
  value: string,
  queryInterface: QueryInterface,
  transaction: Transaction
): Promise<LightEntity[]> {
  const queryString = `SELECT id, "${prop}" FROM "${table}" WHERE "${prop}" = '${value}';`;
  return queryInterface.sequelize.query(queryString, {
    transaction,
    type: QueryTypes.SELECT,
  });
}

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'GameType',
        'clientSecret',
        {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: await generateSecret(),
        },
        {
          transaction,
        }
      );
      await queryInterface.addColumn(
        'GameType',
        'signingSecret',
        {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: await generateSecret(),
        },
        {
          transaction,
        }
      );

      const [firstUser] = (await queryByProp(
        'User',
        'email',
        firstUserEmail,
        queryInterface,
        transaction
      )) as LightEntity[];

      await queryInterface.addColumn(
        'GameType',
        '_createdById',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: firstUser.id,
          references: {
            model: 'User',
            key: 'id',
          },
        },
        {
          transaction,
        }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('GameType', 'clientSecret', { transaction });
      await queryInterface.removeColumn('GameType', 'signingSecret', { transaction });
      await queryInterface.removeColumn('GameType', '_createdBy', { transaction });
    });
  },
};
