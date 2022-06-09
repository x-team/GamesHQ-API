import { expect } from 'chai';
import { postLeaderboardResultRoute } from '../../../src/modules/gameDevs/gameDevWebhooksRoutes';
import { GameType, LeaderboardEntry, LeaderboardResults } from '../../../src/models';
import { getCustomTestServer } from '../../test-utils';
import { signMessage } from '../../../src/utils/cryptography';
import { v4 as uuid } from 'uuid';

describe('gameDevWebhooksRoutes', () => {
  const testServer = getCustomTestServer();

  testServer.route([postLeaderboardResultRoute]);

  describe(' postLeaderboardResultRoute', async () => {
    it('should return 200 status code on POST /leaderboards/score', async () => {
      const game = await GameType.findByPk(1);
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const rslt = await testServer.inject(
        getPostLeaderboarsScoreInjectOptions(undefined, lb1.id, game!)
      );
      const payload = JSON.parse(rslt.payload);

      const lbrInDB = await LeaderboardResults.findByPk(payload.id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.statusCode).to.equal(200);
      expect(payload.id).to.be.equal(lbrInDB!.id);
      expect(payload._leaderboardEntryId).to.equal(lb1.id);
      expect(payload._userId).to.equal(1);
      expect(payload.score).to.equal(10);
      expect(isNaN(Date.parse(payload.createdAt))).to.be.false;
      expect(isNaN(Date.parse(payload.updatedAt))).to.be.false;
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(1);
    });
  });

  it('should return 200 status code on POST /leaderboards/score without meta', async () => {
    const game = await GameType.findByPk(1);
    const lb1 = await LeaderboardEntry.create({
      _gameTypeId: 1,
      name: 'my_leaderboard_' + uuid(),
    });

    const p = {
      _leaderboardEntryId: lb1.id,
      _userId: 1,
      score: 10,
    };

    let injectOptions = getPostLeaderboarsScoreInjectOptions(p, undefined, game!);

    const rslt = await testServer.inject(injectOptions as any);
    const payload = JSON.parse(rslt.payload);

    const lbrInDB = await LeaderboardResults.findByPk(payload.id, {
      include: LeaderboardResults.associations._leaderboardResultsMeta,
    });

    expect(rslt.statusCode).to.equal(200);
    expect(payload.id).to.be.equal(lbrInDB!.id);
    expect(payload._leaderboardEntryId).to.equal(lb1.id);
    expect(payload._userId).to.equal(1);
    expect(payload.score).to.equal(10);
    expect(isNaN(Date.parse(payload.createdAt))).to.be.false;
    expect(isNaN(Date.parse(payload.updatedAt))).to.be.false;
    expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(0);
  });

  it('should return 200 status code on POST /leaderboards/score with empty meta', async () => {
    const game = await GameType.findByPk(1);
    const lb1 = await LeaderboardEntry.create({
      _gameTypeId: 1,
      name: 'my_leaderboard_' + uuid(),
    });

    const p = {
      _leaderboardEntryId: lb1.id,
      _userId: 1,
      score: 10,
      _leaderboardResultsMeta: [],
    };

    let injectOptions = getPostLeaderboarsScoreInjectOptions(p, undefined, game!);

    const rslt = await testServer.inject(injectOptions as any);
    const payload = JSON.parse(rslt.payload);

    const lbrInDB = await LeaderboardResults.findByPk(payload.id, {
      include: LeaderboardResults.associations._leaderboardResultsMeta,
    });

    expect(rslt.statusCode).to.equal(200);
    expect(payload.id).to.be.equal(lbrInDB!.id);
    expect(payload._leaderboardEntryId).to.equal(lb1.id);
    expect(payload._userId).to.equal(1);
    expect(payload.score).to.equal(10);
    expect(isNaN(Date.parse(payload.createdAt))).to.be.false;
    expect(isNaN(Date.parse(payload.updatedAt))).to.be.false;
    expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(0);
  });

  it('should return 400 status code on POST /leaderboards/score on schema validation: missing _leaderboardEntryId', async () => {
    const game = await GameType.findByPk(1);

    const p = {
      // _leaderboardEntryId: lb1.id
      _userId: 1,
      score: 10,
      _leaderboardResultsMeta: [],
    };

    let injectOptions = getPostLeaderboarsScoreInjectOptions(p, undefined, game!);

    const rslt = await testServer.inject(injectOptions as any);
    const payload = JSON.parse(rslt.payload);

    expect(rslt.statusCode).to.equal(400);
    expect(payload.statusCode).to.be.equal(400);
    expect(payload.error).to.be.equal('Bad Request');
    expect(payload.message).to.be.equal('"_leaderboardEntryId" is required');
  });
});

function getPostLeaderboarsScoreInjectOptions(
  p: any,
  _leaderboardEntryId?: number,
  game?: GameType
) {
  const payload = p || {
    _leaderboardEntryId,
    _userId: 1,
    score: 10,
    _leaderboardResultsMeta: [
      {
        attribute: 'timePlayed',
        value: '10000',
      },
    ],
  };
  const timestamp = String(new Date().getTime() / 1000);
  const signatureMessage = `v0:${timestamp}:${JSON.stringify(payload)}`;

  const injectOptions = {
    method: 'POST',
    url: '/webhooks/game-dev/leaderboards/score',
    headers: {
      'xtu-request-timestamp': timestamp,
      'xtu-signature': `v0=${signMessage(signatureMessage, game!.signingSecret)}`,
      'xtu-client-secret': game!.clientSecret,
    },
    payload,
  };

  return injectOptions;
}
