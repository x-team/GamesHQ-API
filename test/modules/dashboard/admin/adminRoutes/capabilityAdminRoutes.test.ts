import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getAllCapabilitiesRoute,
  createCapabilityRoute,
  deleteCapabilityRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/capabilityAdminRoutes';
import {
  getAllCapabilitiesHandler,
  createCapabilityHandler,
  deleteCapabilityHandler,
} from '../../../../../src/modules/dashboard/admin/adminHandlers/capabilityAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';
import {
  getAllCapabilitiesResponseSchema,
  createCapabilitiesRequestSchema,
  createCapabilitiesResponseSchema,
} from '../../../../../src/api-utils/schemas/admin/capabilitySchemas';
import { genericSchema } from '../../../../../src/api-utils/schemas';

describe('capabilityAdminRoutes', () => {
  describe('getAllCapabilitiesRoute', () => {
    it('should be configured as expected', async () => {
      expect(getAllCapabilitiesRoute.method).to.equal('GET');
      expect(getAllCapabilitiesRoute.path).to.equal('/admin/capabilities');
      expect(getAllCapabilitiesRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.CAPABILITY_READ, CAPABILITIES.CAPABILITY_WRITE],
      });
      expect((getAllCapabilitiesRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((getAllCapabilitiesRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((getAllCapabilitiesRoute.options as RouteOptions).response?.schema).to.equal(
        getAllCapabilitiesResponseSchema
      );
      expect(getAllCapabilitiesRoute.handler).to.equal(getAllCapabilitiesHandler);
    });
  });

  describe('createCapabilityRoute', () => {
    it('should be configured as expected', async () => {
      expect(createCapabilityRoute.method).to.equal('POST');
      expect(createCapabilityRoute.path).to.equal('/admin/capabilities');
      expect(createCapabilityRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.CAPABILITY_WRITE],
      });
      expect((createCapabilityRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((createCapabilityRoute.options as RouteOptions).validate?.payload).to.equal(
        createCapabilitiesRequestSchema
      );
      expect((createCapabilityRoute.options as RouteOptions).response?.schema).to.equal(
        createCapabilitiesResponseSchema
      );
      expect(createCapabilityRoute.handler).to.equal(createCapabilityHandler);
    });
  });

  describe('deleteCapabilityRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteCapabilityRoute.method).to.equal('DELETE');
      expect(deleteCapabilityRoute.path).to.equal('/admin/capabilities/{capabilityId}');
      expect(deleteCapabilityRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.CAPABILITY_WRITE],
      });
      expect((deleteCapabilityRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((deleteCapabilityRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((deleteCapabilityRoute.options as RouteOptions).response?.schema).to.equal(
        genericSchema
      );
      expect(deleteCapabilityRoute.handler).to.equal(deleteCapabilityHandler);
    });
  });
});
