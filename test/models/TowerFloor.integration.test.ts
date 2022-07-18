import { expect } from 'chai';
import { addFloor } from '../../src/models/TowerFloor';
import { startTowerGame, TowerGame } from '../../src/models/TowerGame';
import { v4 as uuid } from 'uuid';
import { orderBy } from 'lodash';

describe('TowerFloor', () => {
  describe('addFloor', async () => {
    it('should add new floor', async () => {
      const towerGame = await createTowerGame();
      const rslt = await addFloor(towerGame!.height + 1, towerGame!.id);
      const towerGameAfter = await TowerGame.findByPk(towerGame?.id);

      expect(rslt.number).to.equal(11);
      expect(towerGameAfter?.height).to.equal(11);
    });

    it('should add 2 new floors floor', async () => {
      const towerGame = await createTowerGame();

      const rslt_1 = await addFloor(towerGame!.height + 1, towerGame!.id);
      const rslt_2 = await addFloor(towerGame!.height + 2, towerGame!.id);

      const towerGameAfter = await TowerGame.findByPk(towerGame?.id);

      expect(rslt_1.number).to.equal(11);
      expect(rslt_2.number).to.equal(12);
      expect(towerGameAfter?.height).to.equal(12);
    });

    it('should add new floor in middle of tower', async () => {
      const towerGame = await createTowerGame();

      const rslt_1 = await addFloor(5, towerGame!.id);

      const towerGameAfter = await TowerGame.findByPk(towerGame?.id, {
        include: [
          {
            association: TowerGame.associations._floors,
            separate: true,
            order: [['number', 'ASC']],
          },
        ],
      });

      expect(rslt_1.number).to.equal(5);
      expect(towerGameAfter?.height).to.equal(11);
      expect(towerGameAfter?._floors!.length).to.equal(11);
      expect(towerGameAfter?._floors![4].id).to.equal(rslt_1.id);

      let floor = 1;
      for (const f of towerGameAfter?._floors!) {
        expect(f.number).to.equal(floor++);
      }
    });
  });

  const createTowerGame = async () => {
    const game = await startTowerGame({
      name: 'test_' + uuid(),
      _createdById: 1,
      isOpen: true,
    });

    return await TowerGame.findOne({ where: { _gameId: game.id } });
  };
});
