import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import { slackGamesHqCommandRoute } from '../../../src/modules/slack/slackRoutes';
import { slackCommandHandler } from '../../../src/modules/slack/slackHandlers';
import {
  verifySlackRequestMiddleware,
  parseSlackSlashCommandPayloadMiddleware,
} from '../../../src/api-utils/midddleware';

describe('slackRoutes', () => {
  describe('slackGamesHqCommandRoute', () => {
    it('should be configured as expected', async () => {
      expect(slackGamesHqCommandRoute.method).to.equal('POST');
      expect(slackGamesHqCommandRoute.path).to.equal('/slack-integrations/gameshq-commands');
      expect(slackGamesHqCommandRoute.options?.bind).to.deep.equal(undefined);
      expect((slackGamesHqCommandRoute.options as RouteOptions).auth).to.equal(false);
      expect((slackGamesHqCommandRoute.options as RouteOptions).payload).to.deep.equal({
        parse: false,
        output: 'data',
      });
      expect((slackGamesHqCommandRoute.options as RouteOptions).pre).to.deep.equal([
        verifySlackRequestMiddleware,
        parseSlackSlashCommandPayloadMiddleware,
      ]);
      expect((slackGamesHqCommandRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((slackGamesHqCommandRoute.options as RouteOptions).response?.schema).to.equal(
        undefined
      );
      expect(slackGamesHqCommandRoute.handler).to.equal(slackCommandHandler);
    });
  });
});
