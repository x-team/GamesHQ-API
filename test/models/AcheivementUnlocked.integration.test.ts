import { expect } from 'chai';
import {
  findAchievementUnlocked,
  createOrUpdateAchievementUnlocked,
  AchievementUnlocked,
} from '../../src/models/AchievementUnlocked';
import { Achievement } from '../../src/models/Achievements';

describe('AchievementUnlocked', () => {
  describe('createOrUpdateAchievementUnlocked', () => {
    it('should create Achievement Unlocked', async () => {
      const a = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      const data = {
        _userId: 1,
        _achievementId: a.id,
        progress: 10,
        isUnlocked: true,
      };

      const [rslt] = await createOrUpdateAchievementUnlocked(data);

      expect(rslt!._userId).to.equal(data._userId);
      expect(rslt!._achievementId).to.equal(data._achievementId);
      expect(rslt!.progress).to.equal(data.progress);
      expect(rslt!.isUnlocked).to.equal(data.isUnlocked);
    });

    it('should update Achievement Unlocked', async () => {
      const a = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      await AchievementUnlocked.create({
        _userId: 1,
        _achievementId: a.id,
        progress: 10,
        isUnlocked: true,
      });

      const data = {
        _userId: 1,
        _achievementId: a.id,
        progress: 55,
        isUnlocked: false,
      };

      const [rslt] = await createOrUpdateAchievementUnlocked(data);
      const au = await AchievementUnlocked.findOne({ where: { _userId: 1, _achievementId: a.id } });

      expect(rslt!._userId).to.equal(data._userId);
      expect(rslt!._userId).to.equal(au!._userId);
      expect(rslt!._achievementId).to.equal(data._achievementId);
      expect(rslt!._achievementId).to.equal(au!._achievementId);
      expect(rslt!.progress).to.equal(data.progress);
      expect(rslt!.progress).to.equal(au!.progress);
      expect(rslt!.isUnlocked).to.equal(data.isUnlocked);
      expect(rslt!.isUnlocked).to.equal(au!.isUnlocked);
    });
  });

  describe('findAchievementUnlocked', () => {
    it('should find Achievement Unlocked', async () => {
      const a = await Achievement.create({
        description: 'my_desc',
        targetValue: 100,
        isEnabled: true,
        _gameTypeId: 1,
      });

      await AchievementUnlocked.create({
        _userId: 1,
        _achievementId: a.id,
        progress: 10,
        isUnlocked: true,
      });

      const rslt = await findAchievementUnlocked(1, a.id);

      expect(rslt!._userId).to.equal(1);
      expect(rslt!._achievementId).to.equal(a.id);
      expect(rslt!.progress).to.equal(10);
      expect(rslt!.isUnlocked).to.equal(true);
    });

    it('should return null if Achievement Unlocked not found', async () => {
      const rslt = await findAchievementUnlocked(112321312, 12321);
      expect(rslt).to.be.null;
    });
  });
});
