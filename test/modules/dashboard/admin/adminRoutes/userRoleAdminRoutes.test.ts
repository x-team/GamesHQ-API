import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getAllUserRolesRoute,
  upsertUserRolesRoute,
  deleteUserRolesRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/userRoleAdminRoutes';
import {
  getAllUserRolesHandler,
  upsertUserRolesHandler,
  deleteUserRoleHandler,
} from '../../../../../src/modules/dashboard/admin/adminHandlers/userRoleAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';
import {
  getAllUserRolesResponseSchema,
  upsertUserRoleResponseSchema,
  upsertUserRoleRequestSchema,
} from '../../../../../src/api-utils/schemas/admin/userRoleSchemas';
import { genericSchema } from '../../../../../src/api-utils/schemas';

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

  describe('upsertUserRolesRoute', () => {
    it('should be configured as expected', async () => {
      expect(upsertUserRolesRoute.method).to.equal('POST');
      expect(upsertUserRolesRoute.path).to.equal('/admin/userrole');
      expect(upsertUserRolesRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.USER_ROLE_WRITE],
      });
      expect((upsertUserRolesRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((upsertUserRolesRoute.options as RouteOptions).validate?.payload).to.equal(
        upsertUserRoleRequestSchema
      );
      expect((upsertUserRolesRoute.options as RouteOptions).response?.schema).to.equal(
        upsertUserRoleResponseSchema
      );
      expect(upsertUserRolesRoute.handler).to.equal(upsertUserRolesHandler);
    });
  });

  describe('deleteUserRolesRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteUserRolesRoute.method).to.equal('DELETE');
      expect(deleteUserRolesRoute.path).to.equal('/admin/userrole/{userRoleId}');
      expect(deleteUserRolesRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.USER_ROLE_WRITE],
      });
      expect((deleteUserRolesRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((deleteUserRolesRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((deleteUserRolesRoute.options as RouteOptions).response?.schema).to.equal(
        genericSchema
      );
      expect(deleteUserRolesRoute.handler).to.equal(deleteUserRoleHandler);
    });
  });
});
