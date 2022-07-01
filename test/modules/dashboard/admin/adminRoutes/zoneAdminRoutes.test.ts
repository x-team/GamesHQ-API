import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getZoneRoute,
  getZonesRoute,
  upsertZoneRoute,
  deleteZoneRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/zoneAdminRoutes';
import {
  getZoneHandler,
  getZonesHandler,
  upsertZoneHandler,
  deleteZoneHandler,
} from '../../../../../src/modules/dashboard/admin/adminHandlers/zoneAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';

describe('zoneAdminRoutes', () => {
  describe('getZoneRoute', () => {
    it('should be configured as expected', async () => {
      expect(getZoneRoute.method).to.equal('GET');
      expect(getZoneRoute.path).to.equal('/dashboard/admin/zones/{zoneId}');
      expect(getZoneRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.ZONE_READ, CAPABILITIES.ZONE_WRITE],
      });
      expect((getZoneRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((getZoneRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getZoneRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(getZoneRoute.handler).to.equal(getZoneHandler);
    });
  });

  describe('getZonesRoute', () => {
    it('should be configured as expected', async () => {
      expect(getZonesRoute.method).to.equal('GET');
      expect(getZonesRoute.path).to.equal('/dashboard/admin/zones');
      expect(getZonesRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.ZONE_READ, CAPABILITIES.ZONE_WRITE],
      });
      expect((getZonesRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((getZonesRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getZonesRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(getZonesRoute.handler).to.equal(getZonesHandler);
    });
  });

  describe('upsertZoneRoute', () => {
    it('should be configured as expected', async () => {
      expect(upsertZoneRoute.method).to.equal('POST');
      expect(upsertZoneRoute.path).to.equal('/dashboard/admin/upsertZone');
      expect(upsertZoneRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.ZONE_WRITE],
      });
      expect((upsertZoneRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((upsertZoneRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((upsertZoneRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(upsertZoneRoute.handler).to.equal(upsertZoneHandler);
    });
  });

  describe('deleteZoneRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteZoneRoute.method).to.equal('DELETE');
      expect(deleteZoneRoute.path).to.equal('/dashboard/admin/zones/{zoneId}');
      expect(deleteZoneRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.ZONE_WRITE],
      });
      expect((deleteZoneRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((deleteZoneRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((deleteZoneRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(deleteZoneRoute.handler).to.equal(deleteZoneHandler);
    });
  });
});
