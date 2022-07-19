import { expect } from 'chai';
import { addFloor, removeFloor } from '../../src/models/TowerFloor';
import { startTowerGame, TowerGame } from '../../src/models/TowerGame';
import { v4 as uuid } from 'uuid';
import { addTowerFloorEnemy } from '../../src/models/TowerFloorEnemy';
import { Enemy } from '../../src/models';

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

  describe('removeFloor', async () => {
    it('should remove floor', async () => {
      const towerGame = await createTowerGame();
      await removeFloor(towerGame!._floors![0].id, towerGame!.id);
      const towerGameAfter = await TowerGame.findByPk(towerGame?.id, {
        include: [
          {
            association: TowerGame.associations._floors,
            separate: true,
            order: [['number', 'ASC']],
          },
        ],
      });

      expect(towerGameAfter?.height).to.equal(9);
      expect(towerGameAfter?._floors!.length).to.equal(9);
      let floor = 1;
      for (const f of towerGameAfter?._floors!) {
        expect(f.number).to.equal(floor++);
        expect(f.id).to.not.equal(towerGame!._floors![0].id);
      }
    });

    it('should remove floor with enemies', async () => {
      const towerGame = await createTowerGame();
      const enemy = await Enemy.findByPk(1);
      await addTowerFloorEnemy(towerGame!._floors![0].id, enemy!);

      await removeFloor(towerGame!._floors![0].id, towerGame!.id);
      const towerGameAfter = await TowerGame.findByPk(towerGame?.id, {
        include: [
          {
            association: TowerGame.associations._floors,
            separate: true,
            order: [['number', 'ASC']],
          },
        ],
      });

      expect(towerGameAfter?.height).to.equal(9);
      expect(towerGameAfter?._floors!.length).to.equal(9);
      let floor = 1;
      for (const f of towerGameAfter?._floors!) {
        expect(f.number).to.equal(floor++);
        expect(f.id).to.not.equal(towerGame!._floors![0].id);
      }
    });

    it('should not remove floor if floor does not exist', async () => {
      const towerGame = await createTowerGame();
      await removeFloor(123, towerGame!.id);
      const towerGameAfter = await TowerGame.findByPk(towerGame?.id, {
        include: [
          {
            association: TowerGame.associations._floors,
            separate: true,
            order: [['number', 'ASC']],
          },
        ],
      });

      expect(towerGameAfter?.height).to.equal(10);
      expect(towerGameAfter?._floors!.length).to.equal(10);
      let floor = 1;
      for (const f of towerGameAfter?._floors!) {
        expect(f.number).to.equal(floor++);
      }
    });

    it('should not remove floor if tower game does not exist', async () => {
      const towerGame = await createTowerGame();
      await removeFloor(1, 123);
      const towerGameAfter = await TowerGame.findByPk(towerGame?.id, {
        include: [
          {
            association: TowerGame.associations._floors,
            separate: true,
            order: [['number', 'ASC']],
          },
        ],
      });

      expect(towerGameAfter?.height).to.equal(10);
      expect(towerGameAfter?._floors!.length).to.equal(10);
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

    return await TowerGame.findOne({
      where: { _gameId: game.id },
      include: [
        {
          association: TowerGame.associations._floors,
          separate: true,
          order: [['number', 'ASC']],
        },
      ],
    });
  };
});
