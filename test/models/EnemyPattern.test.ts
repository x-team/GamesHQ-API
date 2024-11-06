import { expect } from 'chai';
import { 
  createEnemyPattern, 
  existsEnemyPattern,
  findEnemyPatternById 
} from '../../src/models/EnemyPattern';

describe('EnemyPattern Model', () => {
  describe('createEnemyPattern', () => {
    it('should create a new enemy pattern', async () => {
      const pattern = 'HCA'; // Hunt, Charge, Attack
      const result = await createEnemyPattern(pattern);
      expect(result.id).to.equal(pattern);
    });
  });

  describe('existsEnemyPattern', () => {
    it('should return true for existing pattern', async () => {
      const pattern = 'HCA';
      await createEnemyPattern(pattern);
      const exists = await existsEnemyPattern(pattern);
      expect(exists).to.be.true;
    });

    it('should return false for non-existing pattern', async () => {
      const exists = await existsEnemyPattern('XXX');
      expect(exists).to.be.false;
    });
  });

  describe('findEnemyPatternById', () => {
    it('should find pattern by id', async () => {
      const pattern = 'HCA';
      await createEnemyPattern(pattern);
      const result = await findEnemyPatternById(pattern);
      expect(result?.id).to.equal(pattern);
    });

    it('should return null for non-existing pattern', async () => {
      const result = await findEnemyPatternById('XXX');
      expect(result).to.be.null;
    });
  });
});
