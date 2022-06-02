import { expect } from 'chai';
import { v4 as uuid } from 'uuid';
import { findActiveGame, findLastActiveGame, createGame } from '../../src/models/Game';

describe('Game', () => {
  describe('findActiveGame', () => {
    it('should find active The Tower game', async () => {
      const firstGameName = {
        name: '1_1_My_The_Tower_test_game_' + uuid(),
        _createdById: 1,
        startedAt: new Date(),
        _gameTypeId: 1,
      };

      const secondGameName = {
        name: '1_2_My_The_Tower_test_game_' + uuid(),
        _createdById: 1,
        startedAt: new Date(firstGameName.startedAt.getTime() + 1),
        _gameTypeId: 1,
      };

      await createGame(firstGameName);
      await createGame(secondGameName);

      const game = await findActiveGame('The Tower');

      expect(game?.name).to.be.equal(secondGameName.name);
    });
  });

  describe('findLastActiveGame', () => {
    it('should find last active The Tower game', async () => {
      const firstGameName = {
        name: '2_1_My_The_Tower_test_game_' + uuid(),
        _createdById: 1,
        startedAt: new Date(),
        _gameTypeId: 1,
      };

      const secondGameName = {
        name: '2_2_My_The_Tower_test_game_' + uuid(),
        _createdById: 1,
        startedAt: new Date(firstGameName.startedAt.getTime() + 1),
        _gameTypeId: 1,
      };

      const firstTowerGame = await createGame(firstGameName);
      const secondTowerGame = await createGame(secondGameName);

      await firstTowerGame.endGame();
      await secondTowerGame.endGame();

      const game = await findLastActiveGame('The Tower');

      expect(game?.name).to.be.equal(secondTowerGame.name);
    });
  });
});
