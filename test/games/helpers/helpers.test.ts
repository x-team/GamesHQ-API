import { expect } from 'chai';
import {
  basicHealthDisplay,
  generateHealthBar,
  roundActionMessageBuilder,
  weaponStatus,
} from '../../../src/games/helpers';
import { ArenaItemInventory } from '../../../src/models';

describe('Helper functions', () => {
  describe('roundActionMessageBuilder', () => {
    const rightMessage = `When the round begins...\n\t- You will work out :test:\n\t- *You will be visible.* :eyes: Keep your head down!`;
    const notVisibleMessage = `When the round begins...\n\t- You will work out :test:\n\t- TestMan\n\t- *You will be visible.* :eyes: Keep your head down!`;

    it('should generate the correct message', () => {
      const message = roundActionMessageBuilder('work out', ':test:', true);
      expect(message).to.equal(rightMessage);
    });
    it('should generate the wrong message with the wrong parameters', () => {
      const message = roundActionMessageBuilder('work', ':test:', false);
      expect(message).to.not.equal(rightMessage);
    });
    it('should generate the additional messages sent', () => {
      const message = roundActionMessageBuilder('work out', ':test:', true, 'TestMan');
      expect(message).to.equal(notVisibleMessage);
    });
  });
  describe('basicHealthDisplay', () => {
    it('should send the right emoji on 0 health', () => {
      const message = basicHealthDisplay(0, 100);
      expect(message).to.equal(`:health-empty: (0) `);
    });
  });
  describe('generateHealthDisplay', () => {
    it('should send the right message when on 50 health', () => {
      const message = generateHealthBar(100, 50);
      expect(message).to.equal(
        `( 50 / 100 ) :health-full: :health-full: :health-full: :health-full: :health-full: :health-empty: :health-empty: :health-empty: :health-empty: :health-empty:`
      );
    });
    it('should send the right message when on 100 health', () => {
      const message = generateHealthBar(100, 100);
      expect(message).to.equal(
        `( 100 / 100 ) :health-full: :health-full: :health-full: :health-full: :health-full: :health-full: :health-full: :health-full: :health-full: :health-full:`
      );
    });
  });
  describe('weaponStatus', () => {
    const weapon = new ArenaItemInventory();
    it('should send the right weapon status message with no weapons', () => {
      const message = weaponStatus([]);
      console.log(message);
      expect(message).to.equal(':blaster: *Inventory:* (no weapon)');
    });
  });
});
