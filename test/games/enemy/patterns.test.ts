import { expect } from 'chai';
import { generateEnemyPatterns } from '../../../src/games/enemy/helpers/enemyPatterns';
import { GAME_TYPE } from '../../../src/games/consts/global';

describe('Enemy Patterns', () => {
  describe('generateEnemyPatterns', () => {
    it('should generate correct number of patterns for length 1', () => {
      const patterns = generateEnemyPatterns(1, GAME_TYPE.TOWER);
      expect(patterns.length).to.equal(3);
    });

    it('should generate correct number of patterns for length 2', () => {
      const patterns = generateEnemyPatterns(2, GAME_TYPE.TOWER);
      expect(patterns.length).to.equal(9);
    });

    it('should generate valid pattern strings', () => {
      const patterns = generateEnemyPatterns(1, GAME_TYPE.TOWER);
      patterns.forEach(pattern => {
        expect(pattern).to.match(/^[HCA]$/); // Hunt, Charge or Attack
      });
    });

    it('should throw error for invalid length', () => {
      expect(() => generateEnemyPatterns(0, GAME_TYPE.TOWER)).to.throw();
      expect(() => generateEnemyPatterns(-1, GAME_TYPE.TOWER)).to.throw();
    });
  });
});
