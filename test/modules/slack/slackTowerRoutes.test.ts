import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  slackCommandRoute,
  towerSlackActionRoute,
  towerSlackEventRoute,
} from '../../../src/modules/slack/slackTowerRoute';
import {
  slackCommandHandler,
  towerSlackActionHandler,
  towerSlackEventHandler,
} from '../../../src/modules/slack/slackHandlers';
import {
  verifySlackRequestMiddleware,
  parseSlackEventPayloadMiddleware,
  parseSlackActionPayloadMiddleware,
  parseSlackSlashCommandPayloadMiddleware,
} from '../../../src/api-utils/midddleware';

describe('slackTowerRoutes', () => {
  describe('slackCommandRoute', () => {
    it('should be configured as expected', async () => {
      expect(slackCommandRoute.method).to.equal('POST');
      expect(slackCommandRoute.path).to.equal('/slack-integrations/tower-commands');
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

  describe('towerSlackActionRoute', () => {
    it('should be configured as expected', async () => {
      expect(towerSlackActionRoute.method).to.equal('POST');
      expect(towerSlackActionRoute.path).to.equal('/slack-integrations/tower-actions');
      expect(towerSlackActionRoute.options?.bind).to.deep.equal(undefined);
      expect((towerSlackActionRoute.options as RouteOptions).auth).to.equal(false);
      expect((towerSlackActionRoute.options as RouteOptions).payload).to.deep.equal({
        parse: false,
        output: 'data',
      });
      expect((towerSlackActionRoute.options as RouteOptions).pre).to.deep.equal([
        verifySlackRequestMiddleware,
        parseSlackActionPayloadMiddleware,
      ]);
      expect((towerSlackActionRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((towerSlackActionRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(towerSlackActionRoute.handler).to.equal(towerSlackActionHandler);
    });
  });

  describe('towerSlackEventRoute', () => {
    it('should be configured as expected', async () => {
      expect(towerSlackEventRoute.method).to.equal('POST');
      expect(towerSlackEventRoute.path).to.equal('/slack-integrations/tower-events');
      expect(towerSlackEventRoute.options?.bind).to.deep.equal(undefined);
      expect((towerSlackEventRoute.options as RouteOptions).auth).to.equal(false);
      expect((towerSlackEventRoute.options as RouteOptions).payload).to.deep.equal({
        parse: false,
        output: 'data',
      });
      expect((towerSlackEventRoute.options as RouteOptions).pre).to.deep.equal([
        verifySlackRequestMiddleware,
        parseSlackEventPayloadMiddleware,
      ]);
      expect((towerSlackEventRoute.options as RouteOptions).validate?.payload).to.equal(undefined);
      expect((towerSlackEventRoute.options as RouteOptions).response?.schema).to.equal(undefined);
      expect(towerSlackEventRoute.handler).to.equal(towerSlackEventHandler);
    });
  });
});
