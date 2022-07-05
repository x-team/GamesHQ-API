import { getAuthUserMiddleware } from '../../../../api-utils/midddleware';
import { CAPABILITIES } from '../../../../consts/model';
import { getEmojis } from '../adminHandlers/generalAdminHandlers';

export const getEmojisRoute = {
  method: 'GET',
  path: '/admin/getEmoji',
  options: {
    description: 'Get all emojis and their respective URLs (from the X-Team slack)',
    tags: ['api'],
    bind: {
      requiredCapabilities: [CAPABILITIES.GENERAL_READ, CAPABILITIES.GENERAL_WRITE],
    },
    pre: [getAuthUserMiddleware],
  },
  handler: getEmojis,
};
