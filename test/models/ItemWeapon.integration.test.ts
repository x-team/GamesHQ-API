import { expect } from 'chai';
import { Op } from 'sequelize';
import { GAME_TYPE, ITEM_TYPE } from '../../src/games/consts/global';
import { findGameTypeByName } from '../../src/models/GameType';
import { GameItemAvailability } from '../../src/models/GameItemAvailability';
import { listActiveWeaponsByGameType } from '../../src/models/ItemWeapon';
import { fail } from 'assert';

describe('ItemWeapon', () => {
  describe('listActiveWeaponsByGameType', () => {
    it.skip('should list Active weapons by Game Type', async () => {
      const gameType = await findGameTypeByName(GAME_TYPE.ARENA);
      const towerItems = await GameItemAvailability.findAll({
        where: { _gameTypeId: gameType!.id },
      });
      const inactiveItemIds = towerItems.slice(0, 2).map((i) => i._itemId);

      await GameItemAvailability.update(
        { isActive: false },
        {
          where: {
            _gameTypeId: gameType!.id,
            _itemId: {
              [Op.in]: inactiveItemIds,
            },
          },
        }
      );

      const activeWeaponItems = await listActiveWeaponsByGameType(gameType!.name);

      expect(activeWeaponItems.length).to.be.greaterThan(0);

      for (const i of activeWeaponItems) {
        expect(i.type).to.be.equal(ITEM_TYPE.WEAPON);

        if (inactiveItemIds.includes(i.id)) {
          fail('There are inactive items being retured from listActiveWeaponsByGameType()');
        }

        for (const gameItem of i._gameItemAvailability!) {
          expect(gameItem._gameTypeId).to.be.equal(gameType!.id);
          expect(gameItem.isActive).to.be.true;
          expect(gameItem._gameType?.name).to.be.equal(gameType!.name);
        }
      }
    });
  });
});
