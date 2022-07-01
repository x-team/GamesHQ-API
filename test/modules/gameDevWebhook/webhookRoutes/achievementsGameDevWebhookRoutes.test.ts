import { expect } from 'chai';
import { RouteOptions } from '@hapi/hapi';
import {
  getGameAcheivmentsRoute,
  postAchievementProgressRoute,
} from '../../../../src/modules/gameDevWebhook/webhookRoutes/achievementsGameDevWebhookRoutes';
import {
  getAchievementsThruWebhookHandler,
  postAchievementsProgressHandler,
} from '../../../../src/modules/gameDevWebhook/webhookHandlers/achievementsGameDevWebhookHandlers';
import {
  webhookValidationMiddleware,
  // parseWebhookPayloadMiddleware,
  appendUserToRequestMiddleware,
} from '../../../../src/api-utils/midddleware';
import {
  postAchievementProgressResponseSchema,
  // postAchievementProgressRequestSchema,
} from '../../../../src/api-utils/schemas/gameDev/achievementsSchemas';

describe('achievementsGameDevWebhookRoutes', () => {
  describe('getGameAcheivmentsRoute', () => {
    it('should be configured as expected', async () => {
      expect(getGameAcheivmentsRoute.method).to.equal('GET');
      expect(getGameAcheivmentsRoute.path).to.equal('/webhooks/game-dev/achievements');
      expect(getGameAcheivmentsRoute.options?.bind).to.deep.equal(undefined);
      expect((getGameAcheivmentsRoute.options as RouteOptions).pre).to.deep.equal([
        webhookValidationMiddleware,
      ]);
      expect((getGameAcheivmentsRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((getGameAcheivmentsRoute.options as RouteOptions).response?.schema).to.equal(
        undefined
      );
      expect(getGameAcheivmentsRoute.handler).to.equal(getAchievementsThruWebhookHandler);
    });
  });

  describe('postAchievementProgressRoute', () => {
    it('should be configured as expected', async () => {
      expect(postAchievementProgressRoute.method).to.equal('POST');
      expect(postAchievementProgressRoute.path).to.equal(
        '/webhooks/game-dev/achievements/{achievementId}/progress'
      );
      expect(postAchievementProgressRoute.options?.bind).to.deep.equal(undefined);
      expect((postAchievementProgressRoute.options as RouteOptions).pre?.[0]).to.deep.equal(
        webhookValidationMiddleware
      );
      // expect((postAchievementProgressRoute.options as RouteOptions).pre?.[1]).to.equal(
      //   parseWebhookPayloadMiddleware(postAchievementProgressRequestSchema)
      // );
      expect((postAchievementProgressRoute.options as RouteOptions).pre?.[2]).to.deep.equal(
        appendUserToRequestMiddleware
      );
      expect((postAchievementProgressRoute.options as RouteOptions).validate?.payload).to.equal(
        undefined
      );
      expect((postAchievementProgressRoute.options as RouteOptions).response?.schema).to.equal(
        postAchievementProgressResponseSchema
      );
      expect(postAchievementProgressRoute.handler).to.equal(postAchievementsProgressHandler);
    });
  });
});
