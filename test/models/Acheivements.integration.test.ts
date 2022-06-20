import { expect } from 'chai';
import {
  Achievement,
  createOrUpdateAchievement,
  getAchievementByCreator,
  findAllAchievementsByGameType,
  deleteAchievementById,
} from '../../src/models/Achievements';

describe('Achievement', () => {
  describe('createOrUpdateLeaderBoard', () => {
    it('should create Achievement', async () => {
      const gameTypeId = 1;
      const data = {
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
      };

      const [rslt] = await createOrUpdateAchievement(data, gameTypeId);

      expect(rslt.id).to.not.be.undefined;
      expect(rslt._gameTypeId).to.equal(1);
      expect(rslt.description).to.equal('my_desc');
      expect(rslt.targetValue).to.equal(100);
      expect(rslt.isEnabled).to.be.true, expect(rslt.createdAt).to.be.instanceOf(Date);
      expect(rslt.updatedAt).to.be.instanceOf(Date);
    });

    it('should update Achievement', async () => {
      const achievementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const data = {
        id: achievementInDB.id,
        description: 'updated_my_desc',
        targetValue: 123,
        isEnabled: false,
      };

      const [rslt] = await createOrUpdateAchievement(data, 1);

      expect(rslt.id).to.not.be.undefined;
      expect(rslt._gameTypeId).to.equal(1);
      expect(rslt.description).to.equal('updated_my_desc');
      expect(rslt.targetValue).to.equal(123);
      expect(rslt.isEnabled).to.be.false,
        expect(rslt.createdAt).to.deep.equal(achievementInDB.createdAt);
      expect(rslt.updatedAt).to.not.deep.equal(achievementInDB.updatedAt);
    });
  });

  describe('getAchievementByCreator', () => {
    it('should get Achievement by creator', async () => {
      const gameTypeId = 1;
      const userId = 1;

      const achievementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const rslt = await getAchievementByCreator(achievementInDB.id, gameTypeId, userId);

      expect(rslt?.id).to.equal(achievementInDB.id);
      expect(rslt?.description).to.equal(achievementInDB.description);
      expect(rslt?.targetValue).to.equal(achievementInDB.targetValue);
      expect(rslt?.isEnabled).to.equal(achievementInDB.isEnabled);
      expect(rslt?._gameTypeId).to.equal(achievementInDB._gameTypeId);
      expect(rslt?.createdAt).to.be.instanceOf(Date);
      expect(rslt?.updatedAt).to.be.instanceOf(Date);
    });

    it('should return null if not created by user', async () => {
      const gameTypeId = 1;
      const userId = 2;

      const achievementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const rslt = await getAchievementByCreator(achievementInDB.id, gameTypeId, userId);

      expect(rslt).to.be.null;
    });
  });

  describe('findAllAchievementsByGameType', () => {
    it('should get Achievements by gametype', async () => {
      const gameTypeId = 1;

      const achievementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const achievementInDB_2 = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const rslt = await findAllAchievementsByGameType(gameTypeId);

      expect(rslt?.length).to.equal(2);
      expect(rslt[0].id).to.equal(achievementInDB.id);
      expect(rslt[0].description).to.equal(achievementInDB.description);
      expect(rslt[0].targetValue).to.equal(achievementInDB.targetValue);
      expect(rslt[0].isEnabled).to.equal(achievementInDB.isEnabled);
      expect(rslt[0]._gameTypeId).to.equal(achievementInDB._gameTypeId);
      expect(rslt[1].id).to.equal(achievementInDB_2.id);
      expect(rslt[1].description).to.equal(achievementInDB_2.description);
      expect(rslt[1].targetValue).to.equal(achievementInDB_2.targetValue);
      expect(rslt[1].isEnabled).to.equal(achievementInDB_2.isEnabled);
      expect(rslt[1]._gameTypeId).to.equal(achievementInDB_2._gameTypeId);
    });

    it('should return empty list', async () => {
      const gameTypeId = 1;
      const rslt = await findAllAchievementsByGameType(gameTypeId);
      expect(rslt?.length).to.equal(0);
    });
  });

  describe('deleteAchievementById', () => {
    it('should delete Achievement by id', async () => {
      const achievementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const rslt = await deleteAchievementById(achievementInDB.id);

      const achievementDeleted = await Achievement.findByPk(achievementInDB.id);

      expect(rslt).to.equal(1);
      expect(achievementDeleted).to.be.null;
    });

    it('should return 0 if no Achievement found', async () => {
      const rslt = await deleteAchievementById(123456);
      expect(rslt).to.equal(0);
    });
  });
});
