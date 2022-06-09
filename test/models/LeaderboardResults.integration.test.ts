import { expect } from 'chai';
import {
  createOrUpdateLeaderBoardResult,
  LeaderboardResultsCreationAttributes,
} from '../../src/models/LeaderboardResults';
import { LeaderboardEntry, LeaderboardResults } from '../../src/models';
import { v4 as uuid } from 'uuid';

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
});
