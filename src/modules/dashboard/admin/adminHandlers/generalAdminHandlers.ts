import type { Lifecycle } from '@hapi/hapi';
import fetch from 'node-fetch';

import { getConfig } from '../../../../config';

export const getEmojis: Lifecycle.Method = async (_request, h) => {
  const url = 'https://slack.com/api/emoji.list';
  const frontendBotToken = getConfig('FRONT_END_APP_BOT_TOKEN');
  const { emoji } = await fetch(url, {
    headers: {
      Authorization: `Bearer ${frontendBotToken}`,
    },
  }).then((response) => response.json() as any);

  return h.response({ emoji }).code(200);
};
