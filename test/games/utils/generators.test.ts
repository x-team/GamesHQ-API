import { expect } from 'chai';
import { 
  generateTeamEmoji,
  generateRarityColorEmoji 
} from '../../../src/games/helpers';
import { ITEM_RARITY } from '../../../src/games/consts/global';

describe('Game Generators', () => {
  describe('generateTeamEmoji', () => {
    it('should return team emoji when provided', () => {
      expect(generateTeamEmoji(':test:')).to.equal(':test:');
    });

    it('should return empty string when no emoji provided', () => {
      expect(generateTeamEmoji('')).to.equal('');
      expect(generateTeamEmoji('')).to.equal('');
    });
  });

  describe('generateRarityColorEmoji', () => {
    it('should return correct emoji for each rarity', () => {
      expect(generateRarityColorEmoji(ITEM_RARITY.COMMON)).to.include('white');
      expect(generateRarityColorEmoji(ITEM_RARITY.RARE)).to.include('blue');
      expect(generateRarityColorEmoji(ITEM_RARITY.EPIC)).to.include('purple');
      expect(generateRarityColorEmoji(ITEM_RARITY.LEGENDARY)).to.include('yellow');
    });
  });
});
