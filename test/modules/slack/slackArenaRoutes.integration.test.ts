import { expect } from 'chai';
import sinon from 'sinon';
import { signMessage } from '../../../src/utils/cryptography';
import { slackCommandRoute } from '../../../src/modules/slack/slackArenaRoute';
import { getCustomTestServer } from '../../test-utils';
import { User } from '../../../src/models';
import { ARENA_SLACK_COMMANDS } from '../../../src/games/arena/consts';
import * as arenaUtils from '../../../src/games/arena/utils';
import * as utils from '../../../src/games/utils';

describe('slackArenaRoute', () => {
  const testServer = getCustomTestServer();

  testServer.route([slackCommandRoute]);

  describe('slackCommandRoute', () => {
    const stubbedPublishArenaMessage = sinon.stub(arenaUtils, 'publishArenaMessage').resolves();
    const stubbedNotifyEphemeral = sinon.stub(utils, 'notifyEphemeral').resolves();
    it('should be configured as expected', async () => {
      await startArenaGame();
      await startRound(1);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await startRound(2);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await startRound(3);
    });

    async function startArenaGame() {
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
    }

    async function startRound(roundNum: number) {
      const user = await User.findByPk(1);

      const jsonPayload: { [key: string]: string } = {
        command: ARENA_SLACK_COMMANDS.START_ROUND,
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
      expect(payload.text).contains('Resolved last round and started a new one');

      if (roundNum === 1) {
        checkRound1();
      } else if (roundNum === 2) {
        checkRound2();
      }

      sinon.reset();
    }

    function checkRound1() {
      expect(stubbedPublishArenaMessage).callCount(0);
      expect(stubbedNotifyEphemeral).callCount(0);
    }

    function checkRound2() {
      expect(stubbedPublishArenaMessage).callCount(4);
      expect(stubbedPublishArenaMessage.args[0]).to.deep.equal(['Ending the round...', true]);
      expect(stubbedPublishArenaMessage.args[1]).to.deep.equal([
        '_*Total players still alive:* 0_',
      ]);
      expect(stubbedPublishArenaMessage.args[2]).to.deep.equal([
        '_*Areas still active:*_ :arena-closed-gate: :arena-obsidian-tower: :arena-white-fortress: :arena-shrine-of-time: :arena-bamboo-forest: :arena-pridelands: :arena-ursine-darkwoods: :arena-phoenix-pyramids: :arena-canine-mansion: :arena-viking-watchtower: :arena-portal:',
      ]);
      expect(stubbedPublishArenaMessage.args[3]).to.deep.equal([
        ':spinner: Alive players are moving to a different area.\n :eyes: Check your `Status`',
      ]);

      expect(stubbedNotifyEphemeral).callCount(1);
      expect(stubbedNotifyEphemeral.args[0]).to.deep.equal([
        'Resolved last round and started a new one.',
        'UBZ9PC0SK',
        'UBZ9PC0SK',
        'fake',
        undefined,
      ]);
    }
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
