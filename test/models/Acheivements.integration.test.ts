import { expect } from 'chai';
import {
  Achievement,
  createOrUpdateAchievement,
  getAcheivementByCreator,
  findAllAchievementsByGameType,
} from '../../src/models/Achievements';

describe('Acheivement', () => {
  describe('createOrUpdateLeaderBoard', () => {
    it('should create Acheivement', async () => {
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

    it('should update Acheivement', async () => {
      const acheivementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const data = {
        id: acheivementInDB.id,
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
        expect(rslt.createdAt).to.deep.equal(acheivementInDB.createdAt);
      expect(rslt.updatedAt).to.not.deep.equal(acheivementInDB.updatedAt);
    });
  });

  describe('getAcheivementByCreator', () => {
    it('should get Acheivement by creator', async () => {
      const gameTypeId = 1;
      const userId = 1;

      const acheivementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const rslt = await getAcheivementByCreator(acheivementInDB.id, gameTypeId, userId);

      expect(rslt?.id).to.equal(acheivementInDB.id);
      expect(rslt?.description).to.equal(acheivementInDB.description);
      expect(rslt?.targetValue).to.equal(acheivementInDB.targetValue);
      expect(rslt?.isEnabled).to.equal(acheivementInDB.isEnabled);
      expect(rslt?._gameTypeId).to.equal(acheivementInDB._gameTypeId);
      expect(rslt?.createdAt).to.be.instanceOf(Date);
      expect(rslt?.updatedAt).to.be.instanceOf(Date);
    });

    it('should return null if not created by user', async () => {
      const gameTypeId = 1;
      const userId = 2;

      const acheivementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const rslt = await getAcheivementByCreator(acheivementInDB.id, gameTypeId, userId);

      expect(rslt).to.be.null;
    });
  });

  describe('findAllAchievementsByGameType', () => {
    it('should get Acheivements by gametype', async () => {
      const gameTypeId = 1;

      const acheivementInDB = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const acheivementInDB_2 = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const rslt = await findAllAchievementsByGameType(gameTypeId);

      expect(rslt?.length).to.equal(2);
      expect(rslt[0].id).to.equal(acheivementInDB.id);
      expect(rslt[0].description).to.equal(acheivementInDB.description);
      expect(rslt[0].targetValue).to.equal(acheivementInDB.targetValue);
      expect(rslt[0].isEnabled).to.equal(acheivementInDB.isEnabled);
      expect(rslt[0]._gameTypeId).to.equal(acheivementInDB._gameTypeId);
      expect(rslt[1].id).to.equal(acheivementInDB_2.id);
      expect(rslt[1].description).to.equal(acheivementInDB_2.description);
      expect(rslt[1].targetValue).to.equal(acheivementInDB_2.targetValue);
      expect(rslt[1].isEnabled).to.equal(acheivementInDB_2.isEnabled);
      expect(rslt[1]._gameTypeId).to.equal(acheivementInDB_2._gameTypeId);
    });

    it('should return empty list', async () => {
      const gameTypeId = 1;
      const rslt = await findAllAchievementsByGameType(gameTypeId);
      expect(rslt?.length).to.equal(0);
    });
  });
});
