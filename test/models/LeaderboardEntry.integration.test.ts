import { expect } from 'chai';
import {
  LeaderboardEntry,
  getLeaderBoardsByGameType,
  createOrUpdateLeaderBoard,
  ScoreStrategy,
  ResetStrategy,
} from '../../src/models/LeaderboardEntry';
import { v4 as uuid } from 'uuid';

describe('LeaderboardEntry', () => {
  describe('createOrUpdateLeaderBoard', () => {
    it('should create Leaderboard', async () => {
      const data = {
        _gameTypeId: 1,
        name: 'Best_Players_' + uuid(),
      };

      const [rslt] = await createOrUpdateLeaderBoard(data);

      expect(rslt.id).to.not.be.undefined;
      expect(rslt._gameTypeId).to.equal(1);
      expect(rslt.name).to.equal(data.name);
      expect(rslt.scoreStrategy).to.equal('highest');
      expect(rslt.resetStrategy).to.equal('never');
      expect(rslt.createdAt).to.be.instanceOf(Date);
      expect(rslt.updatedAt).to.be.instanceOf(Date);
    });

    it('should update Leaderboard', async () => {
      const data = {
        _gameTypeId: 1,
        name: 'Best_Players_' + uuid(),
      };

      const [rslt] = await createOrUpdateLeaderBoard(data);
      const updatedName = 'Updated_' + uuid();

      const [updatedLeaderboard] = await createOrUpdateLeaderBoard({
        id: rslt.id,
        _gameTypeId: 1,
        name: updatedName,
        scoreStrategy: ScoreStrategy.LOWEST,
        resetStrategy: ResetStrategy.DAILY,
      });

      expect(updatedLeaderboard.id).to.not.be.undefined;
      expect(updatedLeaderboard._gameTypeId).to.equal(1);
      expect(updatedLeaderboard.name).to.equal(updatedName);
      expect(updatedLeaderboard.scoreStrategy).to.equal('lowest');
      expect(updatedLeaderboard.resetStrategy).to.equal('daily');
      expect(updatedLeaderboard.createdAt).to.be.instanceOf(Date);
      expect(updatedLeaderboard.updatedAt).to.be.instanceOf(Date);
    });

    it('should create Leaderboard with nonDefault scoreStrategy and resetStrategy', async () => {
      const data = {
        _gameTypeId: 1,
        name: 'Best_Players_' + uuid(),
        scoreStrategy: ScoreStrategy.LOWEST,
        resetStrategy: ResetStrategy.DAILY,
      };

      const [rslt] = await createOrUpdateLeaderBoard(data);

      expect(rslt.id).to.not.be.undefined;
      expect(rslt._gameTypeId).to.equal(1);
      expect(rslt.name).to.equal(data.name);
      expect(rslt.scoreStrategy).to.equal('lowest');
      expect(rslt.resetStrategy).to.equal('daily');
      expect(rslt.createdAt).to.be.instanceOf(Date);
      expect(rslt.updatedAt).to.be.instanceOf(Date);
    });
  });

  describe('getLeaderBoardsByGameType', () => {
    it('should get LeaderBoard by The Arena', async () => {
      await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'The_tower_leaderboard_' + uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await LeaderboardEntry.create({
        _gameTypeId: 1,
        name: 'The_tower_leaderboard_' + uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await LeaderboardEntry.create({
        _gameTypeId: 2,
        name: 'The_arena_leaderboard_' + uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await LeaderboardEntry.create({
        _gameTypeId: 2,
        name: 'The_arena_leaderboard_' + uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const theArenaLeaderboards = await getLeaderBoardsByGameType(2);

      expect(theArenaLeaderboards.length).to.equal(2);

      for (const leaderboard of theArenaLeaderboards) {
        expect(leaderboard._gameTypeId).to.equal(2);
        expect(leaderboard.name).to.contain('The_arena_leaderboard_');
      }
    });
  });
});
