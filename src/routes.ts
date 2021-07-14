import type { ServerRoute } from '@hapi/hapi';

import { slackArenaRoutes } from './modules/slack/slackArenaRoute';
import { slackRoutes } from './modules/slack/slackRoutes';

export const routes: ServerRoute[] = [...slackRoutes, ...slackArenaRoutes];
