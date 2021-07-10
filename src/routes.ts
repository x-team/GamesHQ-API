import type { ServerRoute } from '@hapi/hapi';

import { slackRoutes } from './modules/slack/slackRoutes';
import { slackArenaRoutes } from './modules/slack/slackArenaRoute';

export const routes: ServerRoute[] = [...slackRoutes, ...slackArenaRoutes];
