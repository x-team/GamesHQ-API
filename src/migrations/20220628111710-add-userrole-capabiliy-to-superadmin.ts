import { Op } from 'sequelize';
import type { QueryInterface, Sequelize } from 'sequelize';

import type { Capability, UserRole } from '../models';

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}
module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        'Capability',
        ['USER_ROLE_WRITE', 'USER_ROLE_READ'].map(
          (capability) => {
            return {
              name: capability,
            };
          },
          {
            transaction,
          }
        )
      );

      const [userRoles] = await queryInterface.sequelize.query(
        'SELECT * from "UserRole" WHERE name = \'super_admin\''
      );
      const [capabilities] = await queryInterface.sequelize.query(
        "SELECT * from \"Capability\" WHERE name = 'USER_ROLE_WRITE' or name = 'USER_ROLE_READ'"
      );

      for (const capability of capabilities as Capability[]) {
        await queryInterface.insert(
          null,
          'UserRoleCapability',
          {
            _userRoleId: (userRoles as UserRole[])[0].id,
            _capabilityId: capability.id,
          },
          { transaction }
        );
      }
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        'Capability',
        {
          [Op.or]: [{ name: 'USER_ROLE_READ' }, { name: 'USER_ROLE_WRITE' }],
        },
        { transaction }
      );
    });
  },
};
