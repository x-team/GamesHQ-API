import { CAPABILITIES } from '../../../../api-utils/interfaceAndTypes';
import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { getEmojis } from '../adminHandlers/generalAdminHandlers';

export const getEmojisRoute = {
  method: 'GET',
  path: '/admin/getEmoji',
  options: {
    description: 'Get all emojis and their respective URLs (from the X-Team slack)',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.ADMIN_ACTIONS],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getEmojis,
};
