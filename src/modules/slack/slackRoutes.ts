import type { ServerRoute } from '@hapi/hapi';
import Joi from 'joi';

import { testRouteHandler } from './slackHandlers';

export const slackRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/slack/test',
    options: {
      description: 'Slack test route',
      tags: ['api'],
      // auth: {
      //   scope: [
      //     USER_ROLE.ADMIN,
      //     USER_ROLE.SUPER_ADMIN,
      //     USER_ROLE.MANAGER,
      //     USER_ROLE.COMMUNITY_TEAM,
      //     USER_ROLE.PEOPLE_OPS,
      //   ],
      // },
      // validate: {
      // query: {
      //   user: Joi.number().optional(),
      //   groupIdList: Joi.array().items(Joi.number()).optional().single(),
      //   manager: Joi.number().optional(),
      //   project: Joi.number().optional(),
      //   company: Joi.number().optional(),
      //   dateFrom: Joi.date().timestamp().optional(),
      //   dateTo: Joi.date().timestamp().optional(),
      //   mood: Joi.extend(stringToArrayExtension)
      //     .arrayString()
      //     .items(
      //       Joi.number()
      //         .valid(MOOD.MOOD_VERY_SAD, MOOD.MOOD_SAD, MOOD.MOOD_HAPPY, MOOD.MOOD_VERY_HAPPY)
      //         .required()
      //     )
      //     .optional(),
      //   textOnly: Joi.boolean().optional(),
      //   page: Joi.number().optional(),
      //   pageSize: Joi.number().optional(),
      //   order: Joi.string().valid('asc', 'desc').allow('', null).optional(),
      // },
      // },
      response: {
        schema: Joi.object({
          data: Joi.object(),
        }),
      },
    },
    handler: testRouteHandler,
  },
];
