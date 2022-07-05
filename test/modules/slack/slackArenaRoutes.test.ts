import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  slackCommandRoute,
  arenaSlackActionRoute,
} from '../../../src/modules/slack/slackArenaRoute';
import {
  slackCommandHandler,
  arenaSlackActionHandler,
} from '../../../src/modules/slack/slackHandlers';
import {
  verifySlackRequestMiddleware,
  parseSlackSlashCommandPayloadMiddleware,
  parseSlackActionPayloadMiddleware,
} from '../../../src/api-utils/midddleware';

describe('slackArenaRoute', () => {
  describe('slackCommandRoute', () => {
    it('should be configured as expected', async () => {
      expect(slackCommandRoute.method).to.equal('POST');
      expect(slackCommandRoute.path).to.equal('/slack-integrations/arena-commands');
      expect(slackCommandRoute.options?.bind).to.deep.equal(undefined);
      expect((slackCommandRoute.options as RouteOptions).auth).to.equal(false);
      expect((slackCommandRoute.options as RouteOptions).payload).to.deep.equal({
        parse: false,
        output: 'data',
      });
      expect((slackCommandRoute.options as RouteOptions).pre).to.deep.equal([
        verifySlackRequestMiddleware,
        parseSlackSlashCommandPayloadMiddleware,
      ]);
      expect((slackCommandRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((slackCommandRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(slackCommandRoute.handler).to.equal(slackCommandHandler);
    });
  });

  describe('arenaSlackActionRoute', () => {
    it('should be configured as expected', async () => {
      expect(arenaSlackActionRoute.method).to.equal('POST');
      expect(arenaSlackActionRoute.path).to.equal('/slack-integrations/arena-actions');
      expect(arenaSlackActionRoute.options?.bind).to.deep.equal(undefined);
      expect((arenaSlackActionRoute.options as RouteOptions).auth).to.equal(false);
      expect((arenaSlackActionRoute.options as RouteOptions).payload).to.deep.equal({
        parse: false,
        output: 'data',
      });
      expect((arenaSlackActionRoute.options as RouteOptions).pre).to.deep.equal([
        verifySlackRequestMiddleware,
        parseSlackActionPayloadMiddleware,
      ]);
      expect((arenaSlackActionRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((arenaSlackActionRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(arenaSlackActionRoute.handler).to.equal(arenaSlackActionHandler);
    });
  });
});
