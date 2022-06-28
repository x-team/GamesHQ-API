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
      const rslt = await queryInterface.bulkInsert(
        'Capability',
        ['USER_ROLE_WRITE', 'USER_ROLE_READ'].map(
          (capability) => {
            return {
              name: capability,
            };
          },
          {
            transaction,
            returning: true,
          }
        )
      );

      console.log('test fred', rslt);

      const [userRoles] = await queryInterface.sequelize.query(
        'SELECT * from "UserRole" WHERE name = \'super_admin\''
      );

      for (const capability of rslt as Capability[]) {
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
    return queryInterface.sequelize.transaction(async (_) => {
      // await queryInterface.bulkDelete('UserRoleCapability', {}, { transaction });
    });
  },
};
