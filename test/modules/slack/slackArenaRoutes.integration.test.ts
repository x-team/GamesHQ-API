import { expect } from 'chai';
import { signMessage } from '../../../src/utils/cryptography';
import { slackCommandRoute } from '../../../src/modules/slack/slackArenaRoute';
import { getCustomTestServer } from '../../test-utils';
import { User } from '../../../src/models';
import { ARENA_SLACK_COMMANDS } from '../../../src/games/arena/consts';

describe('slackArenaRoute', () => {
  const testServer = getCustomTestServer();

  testServer.route([slackCommandRoute]);

  describe('slackCommandRoute', () => {
    it('should be configured as expected', async () => {
      const user = await User.findByPk(3);

      const jsonPayload: { [key: string]: string } = {
        command: ARENA_SLACK_COMMANDS.NEW_GAME,
        text: '',
        response_url: '',
        trigger_id: '',
        user_id: String(user!.slackId),
        user_name: '',
        team_id: '',
        team_domain: '',
        channel_id: '',
        channel_name: '',
      };

      const postPayload = Object.keys(jsonPayload)
        .map((k: string) => `${k}=${jsonPayload![k]}`)
        .join('&');
      const rslt = await testServer.inject(await postSlackCommandInjectOptions(postPayload));
      const payload = JSON.parse(rslt.payload);

      expect(rslt.statusCode).to.equal(200);
      expect(payload.text).contains('*The Arena*\n Game "The Arena');
      expect(payload.text).contains('" has been created.');
    });
  });
});

async function postSlackCommandInjectOptions(payload?: string) {
  const timestamp = String(new Date().getTime() / 1000);
  const signatureMessage = `v0:${timestamp}:${payload || ''}`;

  let injectOptions = {
    method: 'POST',
    url: `/slack-integrations/arena-commands`,
    headers: {
      'x-slack-request-timestamp': timestamp,
      'x-slack-signature': `v0=${signMessage(signatureMessage, 'fake')}`,
    },
    payload: payload || {},
  };

  return injectOptions;
}
