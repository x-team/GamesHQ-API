import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getWeaponsRoute,
  getWeaponByIdRoute,
  upsertWeaponRoute,
  deleteWeaponRoute,
} from '../../../../../src/modules/dashboard/admin/adminRoutes/weaponAdminRoutes';
import {
  getWeaponsHandler,
  getWeaponHandler,
  upsertWeaponHandler,
  deleteWeaponHandler,
} from '../../../../../src/modules/dashboard/admin/adminHandlers/weaponAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';

describe('generalAdminRoutes', () => {
  describe('getWeaponsRoute', () => {
    it('should be configured as expected', async () => {
      expect(getWeaponsRoute.method).to.equal('GET');
      expect(getWeaponsRoute.path).to.equal('/dashboard/admin/getWeapons');
      expect(getWeaponsRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.WEAPONS_READ, CAPABILITIES.WEAPONS_WRITE],
      });
      expect((getWeaponsRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((getWeaponsRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getWeaponsRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(getWeaponsRoute.handler).to.equal(getWeaponsHandler);
    });
  });

  describe('getWeaponByIdRoute', () => {
    it('should be configured as expected', async () => {
      expect(getWeaponByIdRoute.method).to.equal('GET');
      expect(getWeaponByIdRoute.path).to.equal('/dashboard/admin/weapons/{weaponId}');
      expect(getWeaponByIdRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.WEAPONS_READ, CAPABILITIES.WEAPONS_WRITE],
      });
      expect((getWeaponByIdRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((getWeaponByIdRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getWeaponByIdRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(getWeaponByIdRoute.handler).to.equal(getWeaponHandler);
    });
  });

  describe('upsertWeaponRoute', () => {
    it('should be configured as expected', async () => {
      expect(upsertWeaponRoute.method).to.equal('POST');
      expect(upsertWeaponRoute.path).to.equal('/dashboard/admin/upsertWeapon');
      expect(upsertWeaponRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.WEAPONS_WRITE],
      });
      expect((upsertWeaponRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((upsertWeaponRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((upsertWeaponRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(upsertWeaponRoute.handler).to.equal(upsertWeaponHandler);
    });
  });

  describe('deleteWeaponRoute', () => {
    it('should be configured as expected', async () => {
      expect(deleteWeaponRoute.method).to.equal('DELETE');
      expect(deleteWeaponRoute.path).to.equal('/dashboard/admin/weapons/{itemId}');
      expect(deleteWeaponRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.WEAPONS_WRITE],
      });
      expect((deleteWeaponRoute.options as RouteOptions).pre).to.deep.equal([
        getAuthUserMiddleware,
      ]);
      expect((deleteWeaponRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((deleteWeaponRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(deleteWeaponRoute.handler).to.equal(deleteWeaponHandler);
    });
  });
});
