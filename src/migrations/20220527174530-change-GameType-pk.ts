import * as fs from 'fs';

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
      const changeGameTypePKtoInt = fs.readFileSync(
        __dirname + '/changeGameTypePKtoInt.sql',
        'utf-8'
      );

      await queryInterface.sequelize.query(changeGameTypePKtoInt, {
        transaction,
      });
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      const revertChangeGameTypePKtoIntSql = fs.readFileSync(
        __dirname + '/revertChangeGameTypePKtoInt.sql',
        'utf-8'
      );

      await queryInterface.sequelize.query(revertChangeGameTypePKtoIntSql, {
        transaction,
      });
    });
  },
};
