import { v4 as uuid } from 'uuid';
import { expect } from 'chai';
import { Game } from '../../src/models';
import { findActiveRound } from '../../src/models/ArenaRound';
import { createArenaGame } from '../../src/models/ArenaGame';

describe('ArenaRound', () => {
  describe('findActiveRound', () => {
    it('should find active round', async () => {
      const newGame = Game.build({
        name: 'my_game_' + uuid(),
        isActive: true,
        startedAt: new Date(),
        _createdById: 1,
        _gameTypeId: 2, // THE ARENA id
      });

      const game = await newGame.save();
      const createdArenaGame = await createArenaGame(game, { _gameId: game.id });

      const rslt = await findActiveRound(false);

      expect(rslt?.id).to.equal(createdArenaGame._arena?._rounds![0].id);
    });
  });
});
