import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import { getEmojisRoute } from '../../../../../src/modules/dashboard/admin/adminRoutes/generalAdminRoutes';
import { getEmojis } from '../../../../../src/modules/dashboard/admin/adminHandlers/generalAdminHandlers';
import { CAPABILITIES } from '../../../../../src/consts/model';
import { getAuthUserMiddleware } from '../../../../../src/api-utils/midddleware';

describe('generalAdminRoutes', () => {
  describe('getEmojisRoute', () => {
    it('should be configured as expected', async () => {
      expect(getEmojisRoute.method).to.equal('GET');
      expect(getEmojisRoute.path).to.equal('/admin/getEmoji');
      expect(getEmojisRoute.options?.bind).to.deep.equal({
        requiredCapabilities: [CAPABILITIES.GENERAL_READ, CAPABILITIES.GENERAL_WRITE],
      });
      expect((getEmojisRoute.options as RouteOptions).pre).to.deep.equal([getAuthUserMiddleware]);
      expect((getEmojisRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((getEmojisRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(getEmojisRoute.handler).to.equal(getEmojis);
    });
  });
});
