import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  loginWithGoogleRoute,
  logutFromAPIRoute,
  checkAvailableSessionRoute,
} from '../../../../src/modules/users/userRoutes';
import { sessionSchema, logoutSessionSchema } from '../../../../src/api-utils/schemas/user';
import {
  loginWithGoogle,
  logutFromAPI,
  checkAvailableSession,
} from '../../../../src/modules/users/userHandler';

describe('userRoutes', () => {
  describe('loginWithGoogleRoute', () => {
    it('should be configured as expected', async () => {
      expect(loginWithGoogleRoute.method).to.deep.equal(['GET', 'POST']);
      expect(loginWithGoogleRoute.path).to.equal('/general/login/google');
      expect(loginWithGoogleRoute.options?.bind).to.deep.equal(undefined);
      expect((loginWithGoogleRoute.options as RouteOptions).pre).to.deep.equal(undefined);
      expect((loginWithGoogleRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((loginWithGoogleRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(loginWithGoogleRoute.handler).to.equal(loginWithGoogle);
    });
  });

  describe('logutFromAPIRoute', () => {
    it('should be configured as expected', async () => {
      expect(logutFromAPIRoute.method).to.deep.equal(['GET']);
      expect(logutFromAPIRoute.path).to.equal('/general/logout');
      expect(logutFromAPIRoute.options?.bind).to.deep.equal(undefined);
      expect((logutFromAPIRoute.options as RouteOptions).pre).to.deep.equal(undefined);
      expect((logutFromAPIRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((logutFromAPIRoute.options as RouteOptions).response?.schema).to.equal(
        logoutSessionSchema
      );
      expect(logutFromAPIRoute.handler).to.equal(logutFromAPI);
    });
  });

  describe('checkAvailableSessionRoute', () => {
    it('should be configured as expected', async () => {
      expect(checkAvailableSessionRoute.method).to.deep.equal(['GET']);
      expect(checkAvailableSessionRoute.path).to.equal('/general/login/session');
      expect(checkAvailableSessionRoute.options?.bind).to.deep.equal(undefined);
      expect((checkAvailableSessionRoute.options as RouteOptions).pre).to.deep.equal(undefined);
      expect((checkAvailableSessionRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((checkAvailableSessionRoute.options as RouteOptions).response?.schema).to.equal(
        sessionSchema
      );
      expect(checkAvailableSessionRoute.handler).to.equal(checkAvailableSession);
    });
  });
});
