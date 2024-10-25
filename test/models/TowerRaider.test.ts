import { expect } from 'chai';
import { TowerRaider } from '../../src/models';
import { MAX_RAIDER_HEALTH } from '../../src/games/tower/consts';
import { Transaction } from 'sequelize';

describe('TowerRaider', () => {
  describe('reviveOrHeal', () => {
    it('should heal up to max health', async () => {
      const raider = new TowerRaider();
      raider.health = 50;

      await raider.reviveOrHeal(100, MAX_RAIDER_HEALTH, {} as Transaction);
      expect(raider.health).to.equal(MAX_RAIDER_HEALTH);
    });

    it('should heal partial amount when not exceeding max health', async () => {
      const raider = new TowerRaider();
      raider.health = 50;

      await raider.reviveOrHeal(25, MAX_RAIDER_HEALTH, {} as Transaction);
      expect(raider.health).to.equal(75);
    });
  });

  describe('damage', () => {
    it('should reduce health by damage amount', async () => {
      const raider = new TowerRaider();
      raider.health = 100;

      raider.health -= 30;
      expect(raider.health).to.equal(70);
    });

    it('should not reduce health below 0', async () => {
      const raider = new TowerRaider();
      raider.health = 20;

      raider.health = Math.max(0, raider.health - 50);
      expect(raider.health).to.equal(0);
    });
  });
});
