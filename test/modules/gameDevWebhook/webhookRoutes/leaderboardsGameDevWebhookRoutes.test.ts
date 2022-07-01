import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getGameLeaderboardResultRoute,
  getUserLeaderboardResultRoute,
  postLeaderboardResultRoute,
} from '../../../../src/modules/gameDevWebhook/webhookRoutes/leaderboardGameDevWebhookRoutes';
import {
  getLeaderboardRankHandler,
  getUserLeaderboardResultHandler,
  postLeaderboardResultHandler,
} from '../../../../src/modules/gameDevWebhook/webhookHandlers/leaderboardGameDevWebhookHandlers';
import {
  webhookValidationMiddleware,
  // parseWebhookPayloadMiddleware,
  appendUserToRequestMiddleware,
} from '../../../../src/api-utils/midddleware';
import {
  getLeaderboardRankResponseSchema,
  getUserLeaderboardResultScoreResponseSchema,
  postLeaderboardResultScoreResponseSchema,
} from '../../../../src/api-utils/schemas/gameDev/leaderboardSchemas';

describe('leaderboardsGameDevWebhookRoutes', () => {
  describe('getGameLeaderboardResultRoute', () => {
    it('should be configured as expected', async () => {
      expect(getGameLeaderboardResultRoute.method).to.equal('GET');
      expect(getGameLeaderboardResultRoute.path).to.equal(
        '/webhooks/game-dev/leaderboards/{leaderboardId}/rank'
      );
      expect(getGameLeaderboardResultRoute.options?.bind).to.deep.equal(undefined);
      expect((getGameLeaderboardResultRoute.options as RouteOptions).pre).to.deep.equal([
        webhookValidationMiddleware,
      ]);
      expect((getGameLeaderboardResultRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((getGameLeaderboardResultRoute.options as RouteOptions).response?.schema).to.equal(
        getLeaderboardRankResponseSchema
      );
      expect(getGameLeaderboardResultRoute.handler).to.equal(getLeaderboardRankHandler);
    });
  });

  describe('getUserLeaderboardResultRoute', () => {
    it('should be configured as expected', async () => {
      expect(getUserLeaderboardResultRoute.method).to.equal('GET');
      expect(getUserLeaderboardResultRoute.path).to.equal(
        '/webhooks/game-dev/leaderboards/{leaderboardId}/score'
      );
      expect(getUserLeaderboardResultRoute.options?.bind).to.deep.equal(undefined);
      expect((getUserLeaderboardResultRoute.options as RouteOptions).pre).to.deep.equal([
        webhookValidationMiddleware,
        appendUserToRequestMiddleware,
      ]);
      expect((getUserLeaderboardResultRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((getUserLeaderboardResultRoute.options as RouteOptions).response?.schema).to.equal(
        getUserLeaderboardResultScoreResponseSchema
      );
      expect(getUserLeaderboardResultRoute.handler).to.equal(getUserLeaderboardResultHandler);
    });
  });

  describe('postLeaderboardResultRoute', () => {
    it('should be configured as expected', async () => {
      expect(postLeaderboardResultRoute.method).to.equal('POST');
      expect(postLeaderboardResultRoute.path).to.equal(
        '/webhooks/game-dev/leaderboards/{leaderboardId}/score'
      );
      expect(postLeaderboardResultRoute.options?.bind).to.deep.equal(undefined);
      expect((postLeaderboardResultRoute.options as RouteOptions).pre?.[0]).to.deep.equal(
        webhookValidationMiddleware
      );
      // expect((postLeaderboardResultRoute.options as RouteOptions).pre?.[1]).to.deep.equal(
      //   parseWebhookPayloadMiddleware
      // );
      expect((postLeaderboardResultRoute.options as RouteOptions).pre?.[2]).to.deep.equal(
        appendUserToRequestMiddleware
      );
      expect((postLeaderboardResultRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((postLeaderboardResultRoute.options as RouteOptions).response?.schema).to.equal(
        postLeaderboardResultScoreResponseSchema
      );
      expect(postLeaderboardResultRoute.handler).to.equal(postLeaderboardResultHandler);
    });
  });
});
