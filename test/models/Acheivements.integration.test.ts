import { expect } from 'chai';
import { Achievement, createOrUpdateAchievement } from '../../src/models/Achievements';

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
});
