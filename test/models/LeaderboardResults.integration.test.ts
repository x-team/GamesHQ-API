import { expect } from 'chai';
import {
  createOrUpdateLeaderBoardResult,
  getLeaderboardResultRank,
  LeaderboardResultsCreationAttributes,
} from '../../src/models/LeaderboardResults';
import { USER_ROLE_LEVEL } from '../../src/consts/model';
import { LeaderboardEntry, LeaderboardResults, User } from '../../src/models';
import { v4 as uuid } from 'uuid';
import { ScoreStrategy } from '../../src/models/LeaderboardEntry';

describe('LeaderboardRestults', () => {
  describe('createOrUpdateLeaderBoardResult', () => {
    it('should create LeaderboardResult', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
        _leaderboardResultsMeta: [
          {
            attribute: 'timePlayed',
            value: '10000',
          },
        ],
      };

      const [rslt] = await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt.id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.id).to.equal(lbrInDB!.id);
      expect(rslt._leaderboardEntryId).to.equal(lb1.id);
      expect(rslt._userId).to.equal(1);
      expect(rslt.score).to.equal(10);
      expect(rslt.createdAt).to.instanceOf(Date);
      expect(rslt.updatedAt).to.instanceOf(Date);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(1);
      expect(lbrInDB?._leaderboardResultsMeta![0].attribute).to.equal('timePlayed');
      expect(lbrInDB?._leaderboardResultsMeta![0].value).to.equal('10000');
    });

    it('should create LeaderboardResult without _leaderboardResultsMeta ', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
      };

      const [rslt] = await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt.id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.id).to.equal(lbrInDB!.id);
      expect(rslt._leaderboardEntryId).to.equal(lb1.id);
      expect(rslt._userId).to.equal(1);
      expect(rslt.score).to.equal(10);
      expect(rslt.createdAt).to.instanceOf(Date);
      expect(rslt.updatedAt).to.instanceOf(Date);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(0);
    });

    it('should create LeaderboardResult with empty _leaderboardResultsMeta', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
        _leaderboardResultsMeta: [],
      };

      const [rslt] = await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt.id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.id).to.equal(lbrInDB!.id);
      expect(rslt._leaderboardEntryId).to.equal(lb1.id);
      expect(rslt._userId).to.equal(1);
      expect(rslt.score).to.equal(10);
      expect(rslt.createdAt).to.instanceOf(Date);
      expect(rslt.updatedAt).to.instanceOf(Date);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(0);
    });

    it('should update LeaderboardResult', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const creatingLBR: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
        _leaderboardResultsMeta: [
          {
            attribute: 'timePlayed',
            value: '10000',
          },
        ],
      };

      await createOrUpdateLeaderBoardResult(creatingLBR);

      const updateLBR: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 555,
        _leaderboardResultsMeta: [
          {
            attribute: 'timePlayed',
            value: '123',
          },
          {
            attribute: 'deviceType',
            value: 'Android',
          },
        ],
      };
      const [rslt] = await createOrUpdateLeaderBoardResult(updateLBR);

      const lbrInDB = await LeaderboardResults.findByPk(rslt.id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt.id).to.equal(lbrInDB!.id);
      expect(rslt._leaderboardEntryId).to.equal(lb1.id);
      expect(rslt._userId).to.equal(1);
      expect(rslt.score).to.equal(555);
      expect(rslt.createdAt).to.instanceOf(Date);
      expect(rslt.updatedAt).to.instanceOf(Date);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(2);
      expect(lbrInDB?._leaderboardResultsMeta![0].attribute).to.equal('timePlayed');
      expect(lbrInDB?._leaderboardResultsMeta![0].value).to.equal('123');
      expect(lbrInDB?._leaderboardResultsMeta![1].attribute).to.equal('deviceType');
      expect(lbrInDB?._leaderboardResultsMeta![1].value).to.equal('Android');
    });
  });

  describe('getLeaderboardResultRank', () => {
    it('should get rank from highest scoreStrategy leaderboard', async () => {
      const lb = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
        scoreStrategy: ScoreStrategy.HIGHEST,
      });

      for (const score of [1, 2, 3, 1]) {
        await LeaderboardResults.create({
          _leaderboardEntryId: lb.id,
          _userId: (await createTestUser()).id,
          score,
        });
      }

      const rslt = await getLeaderboardResultRank(lb);

      expect(rslt.length).to.equal(4);
      expect(rslt[0].score).to.equal(3);
      expect(rslt[1].score).to.equal(2);
      expect(rslt[2].score).to.equal(1);
      expect(rslt[3].score).to.equal(1);
    });

    it('should get rank from lowest scoreStrategy leaderboard', async () => {
      const lb = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
        scoreStrategy: ScoreStrategy.LOWEST,
      });

      for (const score of [1, 2, 3, 1]) {
        await LeaderboardResults.create({
          _leaderboardEntryId: lb.id,
          _userId: (await createTestUser()).id,
          score,
        });
      }

      const rslt = await getLeaderboardResultRank(lb);

      expect(rslt.length).to.equal(4);
      expect(rslt[0].score).to.equal(1);
      expect(rslt[1].score).to.equal(1);
      expect(rslt[2].score).to.equal(2);
      expect(rslt[3].score).to.equal(3);
    });

    it('should get rank from sum scoreStrategy leaderboard', async () => {
      const lb = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
        scoreStrategy: ScoreStrategy.SUM,
      });

      for (const score of [1, 2, 3, 1]) {
        await LeaderboardResults.create({
          _leaderboardEntryId: lb.id,
          _userId: (await createTestUser()).id,
          score,
        });
      }

      const rslt = await getLeaderboardResultRank(lb);

      expect(rslt.length).to.equal(4);
      expect(rslt[0].score).to.equal(3);
      expect(rslt[1].score).to.equal(2);
      expect(rslt[2].score).to.equal(1);
      expect(rslt[3].score).to.equal(1);
    });

    it('should get rank from latest scoreStrategy leaderboard', async () => {
      const lb = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
        scoreStrategy: ScoreStrategy.LATEST,
      });

      for (const score of [1, 2, 3, 1]) {
        await LeaderboardResults.create({
          _leaderboardEntryId: lb.id,
          _userId: (await createTestUser()).id,
          score,
        });
      }

      const rslt = await getLeaderboardResultRank(lb);

      expect(rslt.length).to.equal(4);
      expect(rslt[0].score).to.equal(3);
      expect(rslt[1].score).to.equal(2);
      expect(rslt[2].score).to.equal(1);
      expect(rslt[3].score).to.equal(1);
    });
  });
});

const createTestUser = async () => {
  const uniqueId = uuid();
  return await User.create({
    email: `email_${uniqueId}@test.com`,
    displayName: `displayName_${uniqueId}`,
    firebaseUserUid: null,
    slackId: null,
    profilePictureUrl: null,
    _roleId: USER_ROLE_LEVEL.USER,
    _organizationId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};
