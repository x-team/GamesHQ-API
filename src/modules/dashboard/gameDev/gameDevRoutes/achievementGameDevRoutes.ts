import type { ServerRoute } from '@hapi/hapi';

import {
  getAuthUserMiddleware,
  validateGameAuthMiddleware,
} from '../../../../api-utils/midddleware';
import {
  getAchievementByIdResponseSchema,
  getAchievementsResponseSchema,
  multipleAchievementProgressResponseSchema,
  postAchievementRequestSchema,
  postAchievementResponseSchema,
} from '../../../../api-utils/schemas/gameDev/achievementsSchemas';
import { gamedevGenericSchema } from '../../../../api-utils/schemas/gameDev/gameTypeSchema';
import { CAPABILITIES } from '../../../../consts/model';
import {
  getAchievementsHandler,
  upsertAchievementHandler,
  deleteAchievementHandler,
  getAchievementProgressHandler,
} from '../gameDevHandlers/achievementGameDevHandlers';

//Achievements
export const getAchievementsRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/achievements',
  options: {
    description: `Get game's achievements`,
    tags: ['api'],
    bind: {
      requiredCapabilities: [
        CAPABILITIES.MY_GAME_ACHIEVEMENT_READ,
        CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE,
      ],
    },
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
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
      requiredCapabilities: [
        CAPABILITIES.MY_GAME_ACHIEVEMENT_READ,
        CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE,
      ],
    },
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
    response: {
      schema: getAchievementByIdResponseSchema,
    },
  },
  handler: getAchievementsHandler,
};

export const getAchievementsProgressRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/achievements/{achievementId}/progress',
  options: {
    description: `Get game's achievements progress records`,
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GAMEDEV_ACTIONS],
    },
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
    response: {
      schema: multipleAchievementProgressResponseSchema,
    },
  },
  handler: getAchievementProgressHandler,
};

export const upsertAchievementsRoute: ServerRoute = {
  method: 'POST',
  path: '/dashboard/game-dev/games/{gameTypeId}/achievements',
  options: {
    description: `Add or update a game's achievement`,
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE],
    },
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
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
      requiredCapabilities: [CAPABILITIES.MY_GAME_ACHIEVEMENT_WRITE],
    },
    pre: [getAuthUserMiddleware, validateGameAuthMiddleware],
    response: {
      schema: gamedevGenericSchema,
    },
  },
  handler: deleteAchievementHandler,
};
