import { expect } from 'chai';
import {
  createOrUpdateLeaderBoardResult,
  getLeaderboardResultRank,
  LeaderboardResultsCreationAttributes,
} from '../../src/models/LeaderboardResults';
import { createTestUser } from '../test-utils';
import { LeaderboardEntry, LeaderboardResults } from '../../src/models';
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

      const rslt = await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0]._leaderboardEntryId).to.equal(lb1.id);
      expect(rslt![0]._userId).to.equal(1);
      expect(rslt![0].score).to.equal(10);
      expect(rslt![0].createdAt).to.instanceOf(Date);
      expect(rslt![0].updatedAt).to.instanceOf(Date);
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

      const rslt = await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0]._leaderboardEntryId).to.equal(lb1.id);
      expect(rslt![0]._userId).to.equal(1);
      expect(rslt![0].score).to.equal(10);
      expect(rslt![0].createdAt).to.instanceOf(Date);
      expect(rslt![0].updatedAt).to.instanceOf(Date);
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

      const rslt = await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0]._leaderboardEntryId).to.equal(lb1.id);
      expect(rslt![0]._userId).to.equal(1);
      expect(rslt![0].score).to.equal(10);
      expect(rslt![0].createdAt).to.instanceOf(Date);
      expect(rslt![0].updatedAt).to.instanceOf(Date);
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
      const rslt = await createOrUpdateLeaderBoardResult(updateLBR);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0]._leaderboardEntryId).to.equal(lb1.id);
      expect(rslt![0]._userId).to.equal(1);
      expect(rslt![0].score).to.equal(555);
      expect(rslt![0].createdAt).to.instanceOf(Date);
      expect(rslt![0].updatedAt).to.instanceOf(Date);
      expect(lbrInDB?._leaderboardResultsMeta?.length).to.equal(2);
      expect(lbrInDB?._leaderboardResultsMeta![0].attribute).to.equal('timePlayed');
      expect(lbrInDB?._leaderboardResultsMeta![0].value).to.equal('123');
      expect(lbrInDB?._leaderboardResultsMeta![1].attribute).to.equal('deviceType');
      expect(lbrInDB?._leaderboardResultsMeta![1].value).to.equal('Android');
    });

    it('should update LeaderboardResult highest scoreStrategy', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
      };

      await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const newleaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 11, // new score higher than current
      };

      const rslt = await createOrUpdateLeaderBoardResult(newleaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0].score).to.equal(11);
      expect(lbrInDB!.score).to.equal(11);
    });

    it('should NOT update LeaderboardResult with highest scoreStrategy', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
      };

      const createRslt = await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const newleaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 9, // score lower than current
      };

      const updateRslt = await createOrUpdateLeaderBoardResult(newleaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(createRslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(updateRslt).to.be.undefined;
      expect(lbrInDB!.score).to.equal(10);
    });

    it('should update LeaderboardResult lowest scoreStrategy', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        scoreStrategy: ScoreStrategy.LOWEST,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
      };

      await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const newleaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 9, // new score lower than current
      };

      const rslt = await createOrUpdateLeaderBoardResult(newleaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0].score).to.equal(9);
      expect(lbrInDB!.score).to.equal(9);
    });

    it('should NOT update LeaderboardResult with lowest scoreStrategy', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'my_leaderboard_' + uuid(),
        scoreStrategy: ScoreStrategy.LOWEST,
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
      };

      const createRslt = await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const newleaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 11, // score higher than current
      };

      const updateRslt = await createOrUpdateLeaderBoardResult(newleaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(createRslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(updateRslt).to.be.undefined;
      expect(lbrInDB!.score).to.equal(10);
    });

    it('should update LeaderboardResult sum scoreStrategy', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        scoreStrategy: ScoreStrategy.SUM,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
      };

      await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const newleaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 9, // new score will add with current score
      };

      const rslt = await createOrUpdateLeaderBoardResult(newleaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0].score).to.equal(19);
      expect(lbrInDB!.score).to.equal(19);
    });

    it('should update LeaderboardResult latest scoreStrategy', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        scoreStrategy: ScoreStrategy.LATEST,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
      };

      await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const newleaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 9, // new score will always be updated
      };

      const rslt = await createOrUpdateLeaderBoardResult(newleaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0].score).to.equal(9);
      expect(lbrInDB!.score).to.equal(9);
    });

    it('should update LeaderboardResult latest scoreStrategy', async () => {
      const lb1 = await LeaderboardEntry.create({
        _gameTypeId: 1,
        scoreStrategy: ScoreStrategy.LATEST,
        name: 'my_leaderboard_' + uuid(),
      });

      const leaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 10,
      };

      await createOrUpdateLeaderBoardResult(leaderboardRslt);

      const newleaderboardRslt: LeaderboardResultsCreationAttributes = {
        _leaderboardEntryId: lb1.id,
        _userId: 1,
        score: 11, // new score will always be updated
      };

      const rslt = await createOrUpdateLeaderBoardResult(newleaderboardRslt);

      const lbrInDB = await LeaderboardResults.findByPk(rslt![0].id, {
        include: LeaderboardResults.associations._leaderboardResultsMeta,
      });

      expect(rslt![0].id).to.equal(lbrInDB!.id);
      expect(rslt![0].score).to.equal(11);
      expect(lbrInDB!.score).to.equal(11);
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
