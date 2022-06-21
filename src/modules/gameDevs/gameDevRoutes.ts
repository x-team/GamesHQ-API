import type { ServerRoute } from '@hapi/hapi';

import { getAuthUser } from '../../api-utils/getAuthUser';
import { CAPABILITIES } from '../../api-utils/interfaceAndTypes';
import {
  getAchievementByIdResponseSchema,
  getAchievementsResponseSchema,
  postAchievementRequestSchema,
  postAchievementResponseSchema,
} from '../../api-utils/schemas/gameDev/achievementsSchemas';
import {
  gamedevGenericSchema,
  multipleGamesSchema,
  sigleGameItemSchema,
} from '../../api-utils/schemas/gameDev/game';
import {
  leaderboardSchema,
  multipleLeaderboardSchema,
  postLeaderboardSchema,
} from '../../api-utils/schemas/gameDev/leaderboardSchemas';

import {
  deleteGameTypeHandler,
  getGameTypeHandler,
  getGameTypesHandler,
  upsertGameTypeHandler,
  getLeaderboardHandler,
  upsertLeaderboardHandler,
  deleteLeaderboardHandler,
  getAchievementsHandler,
  upsertAchievementHandler,
  deleteAchievementHandler,
} from './gameDevHandlers';

export const getGameTypesRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games',
  options: {
    description: 'Get all games',
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
      schema: multipleGamesSchema,
    },
  },
  handler: getGameTypesHandler,
};

export const getGameTypeByIdRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}',
  options: {
    description: 'Get specific game by id',
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
      schema: sigleGameItemSchema,
    },
  },
  handler: getGameTypeHandler,
};

export const upsertGameTypeRoute: ServerRoute = {
  method: 'POST',
  path: '/dashboard/game-dev/games/upsertGameType',
  options: {
    description: 'Add or update a game',
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
  handler: upsertGameTypeHandler,
};

export const deleteGameTypeRoute: ServerRoute = {
  method: 'DELETE',
  path: '/dashboard/game-dev/games/{gameTypeId}',
  options: {
    description: 'Delete a game.',
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
  handler: deleteGameTypeHandler,
};

export const getLeaderboardsRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards',
  options: {
    description: 'Fetch game`s leaderboardEntries',
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
      schema: multipleLeaderboardSchema,
    },
  },
  handler: getLeaderboardHandler,
};

export const getLeaderboardByIdRoute: ServerRoute = {
  method: 'GET',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards/{leaderboardId}',
  options: {
    description: 'Fetch game`s leaderboardEntry',
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
      schema: leaderboardSchema,
    },
  },
  handler: getLeaderboardHandler,
};

export const deleteLeaderboardRoute: ServerRoute = {
  method: 'DELETE',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards/{leaderboardId}',
  options: {
    description: 'Delete game`s leaderboardEntry',
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
  handler: deleteLeaderboardHandler,
};

export const upsertLeaderboardRoute: ServerRoute = {
  method: 'POST',
  path: '/dashboard/game-dev/games/{gameTypeId}/leaderboards',
  options: {
    description: 'Add or update a game`s leaderboardEntry',
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
      payload: postLeaderboardSchema,
    },
    response: {
      schema: leaderboardSchema,
    },
  },
  handler: upsertLeaderboardHandler,
};

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

export const gameDevRoutes: ServerRoute[] = [
  // 🎮 Games
  getGameTypesRoute,
  getGameTypeByIdRoute,
  upsertGameTypeRoute,
  deleteGameTypeRoute,
  getLeaderboardsRoute,
  getLeaderboardByIdRoute,
  upsertLeaderboardRoute,
  deleteLeaderboardRoute,
  getAchievementsRoute,
  getAchievementsByIdRoute,
  upsertAchievementsRoute,
  deleteAchievementsRoute,
];
