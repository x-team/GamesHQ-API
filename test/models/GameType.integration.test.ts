import { expect } from 'chai';
import { findGameTypeByName } from '../../src/models/GameType';

describe('GameType', () => {
  describe('findGameTypeByName', () => {
    it('should find "The Tower" game type by name', async () => {
      const gameType = await findGameTypeByName('The Tower');
      expect(gameType?.name).to.be.equal('The Tower');
    });

    it('should find "The Arena" game type by name', async () => {
      const gameType = await findGameTypeByName('The Arena');
      expect(gameType?.name).to.be.equal('The Arena');
    });
  });
});
