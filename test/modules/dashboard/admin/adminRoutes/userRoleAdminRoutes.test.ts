import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import { getUserRoleRoute } from '../../../../../src/modules/dashboard/admin/adminRoutes/userRoleAdminRoutes';
import { getUserRoleHanlder } from '../../../../../src/modules/dashboard/admin/adminHandlers/userRoleAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';
import { getUserRolesSchema } from '../../../../../src/api-utils/schemas/admin/userRoleSchemas';

describe('userRoleAdminRoutes', () => {
  describe('getUserRoleRoute', () => {
    it('should be configured as expected', async () => {
      expect(getUserRoleRoute.method).to.equal('GET');
      expect(getUserRoleRoute.path).to.equal('/admin/userrole');
      expect(getUserRoleRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.USER_ROLE_READ, CAPABILITIES.USER_ROLE_WRITE],
      });
      expect((getUserRoleRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((getUserRoleRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getUserRoleRoute.options as RouteOptions).response?.schema).to.equal(
        getUserRolesSchema
      );
      expect(getUserRoleRoute.handler).to.equal(getUserRoleHanlder);
    });
  });
});
