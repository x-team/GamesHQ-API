import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import { getAllUserRolesRoute } from '../../../../../src/modules/dashboard/admin/adminRoutes/userRoleAdminRoutes';
import { getAllUserRolesHandler } from '../../../../../src/modules/dashboard/admin/adminHandlers/userRoleAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';
import { getAllUserRolesResponseSchema } from '../../../../../src/api-utils/schemas/admin/userRoleSchemas';

describe('userRoleAdminRoutes', () => {
  describe('getAllUserRolesRoute', () => {
    it('should be configured as expected', async () => {
      expect(getAllUserRolesRoute.method).to.equal('GET');
      expect(getAllUserRolesRoute.path).to.equal('/admin/userrole');
      expect(getAllUserRolesRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.USER_ROLE_READ, CAPABILITIES.USER_ROLE_WRITE],
      });
      expect((getAllUserRolesRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((getAllUserRolesRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getAllUserRolesRoute.options as RouteOptions).response?.schema).to.equal(
        getAllUserRolesResponseSchema
      );
      expect(getAllUserRolesRoute.handler).to.equal(getAllUserRolesHandler);
    });
  });
});
