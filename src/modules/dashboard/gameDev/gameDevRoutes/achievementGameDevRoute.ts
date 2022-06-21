import type { ServerRoute } from '@hapi/hapi';

import { getAuthUser } from '../../../../api-utils/getAuthUser';
import { CAPABILITIES } from '../../../../api-utils/interfaceAndTypes';
import {
  getAchievementByIdResponseSchema,
  getAchievementsResponseSchema,
  postAchievementRequestSchema,
  postAchievementResponseSchema,
} from '../../../../api-utils/schemas/gameDev/achievementsSchemas';
import { gamedevGenericSchema } from '../../../../api-utils/schemas/gameDev/game';
import {
  getAchievementsHandler,
  upsertAchievementHandler,
  deleteAchievementHandler,
} from '../gameDevHandlers/achievementGameDevHandler';

//Achievements
export const getAchievementsRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/achievements',
  options: {
    description: `Get game's achievements`,
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [
      {
        method: getAuthUser,
        assign: 'getAuthUser',
      },
    ],
    response: {
      schema: getAchievementsResponseSchema,
    },
  },
  handler: getAchievementsHandler,
};

export const getAchievementsByIdRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/achievements/{achievementId}',
  options: {
    description: `Get game's achievements`,
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [
      {
        method: getAuthUser,
        assign: 'getAuthUser',
      },
    ],
    response: {
      schema: getAchievementByIdResponseSchema,
    },
  },
  handler: getAchievementsHandler,
};

export const upsertAchievementsRoute: ServerRoute = {
  method: 'POST',
  path: '/dashboard/game-dev/games/{gameTypeId}/achievements',
  options: {
    description: `Add or update a game's achievement`,
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [
      {
        method: getAuthUser,
        assign: 'getAuthUser',
      },
    ],
    validate: {
      payload: postAchievementRequestSchema,
    },
    response: {
      schema: postAchievementResponseSchema,
    },
  },
  handler: upsertAchievementHandler,
};

export const deleteAchievementsRoute: ServerRoute = {
  method: 'DELETE',
  path: '/dashboard/game-dev/games/{gameTypeId}/achievements/{achievementId}',
  options: {
    description: `Delete a game's achievement`,
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [
      {
        method: getAuthUser,
        assign: 'getAuthUser',
      },
    ],
    response: {
      schema: gamedevGenericSchema,
    },
  },
  handler: deleteAchievementHandler,
};
