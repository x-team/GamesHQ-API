import { expect } from 'chai';
import { GAME_TYPE } from '../../src/games/consts/global';
import {
  GameItemAvailability,
  enableAllItems,
  disableItems,
} from '../../src/models/GameItemAvailability';
import { findGameTypeByName } from '../../src/models/GameType';

describe('GameItemAvailability', () => {
  describe('enableAllItems', () => {
    it('should enable all items for The Tower', async () => {
      const towerGameType = await findGameTypeByName(GAME_TYPE.TOWER);
      await GameItemAvailability.update(
        { isActive: false },
        { where: { _gameTypeId: towerGameType!.id } }
      );

      await enableAllItems(towerGameType!.id);

      const allGameItemAvailability = await GameItemAvailability.findAll({
        where: { _gameTypeId: towerGameType!.id },
      });
      for (const item of allGameItemAvailability) {
        expect(item.isActive).to.be.true;
      }
    });
  });

  describe('disableItems', () => {
    it('should disable only specific items for The Tower', async () => {
      const towerGameType = await findGameTypeByName(GAME_TYPE.TOWER);
      const items = await GameItemAvailability.update(
        { isActive: false },
        { where: { _gameTypeId: towerGameType!.id }, returning: true }
      );

      const itemIdsNotToDisable = items[1].slice(0, 2).map((i) => i._itemId);

      await disableItems(towerGameType!.id, itemIdsNotToDisable);

      const allGameItemAvailability = await GameItemAvailability.findAll({
        where: { _gameTypeId: towerGameType!.id },
      });

      for (const item of allGameItemAvailability) {
        if (itemIdsNotToDisable.includes(item._itemId)) {
          expect(item.isActive).to.be.true;
        } else {
          expect(item.isActive).to.be.false;
        }
      }
    });
  });
});
