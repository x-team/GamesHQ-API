import { expect } from 'chai';
import { GameError, GAME_ERROR_TYPE } from '../../../src/games/utils/GameError';

describe('GameError', () => {
  it('should create error with type and message', () => {
    const error = new GameError({ 
      type: GAME_ERROR_TYPE.NOT_FOUND,
      message: 'Resource not found'
    });

    expect(error.type).to.equal(GAME_ERROR_TYPE.NOT_FOUND);
    expect(error.message).to.equal('Resource not found');
  });

  it('should create not found error', () => {
    const error = GameError.notFound('User not found');
    
    expect(error.type).to.equal(GAME_ERROR_TYPE.NOT_FOUND);
    expect(error.message).to.equal('User not found');
  });

  it('should create active game error', () => {
    const error = GameError.activeGameRunning('Game already in progress');
    
    expect(error.type).to.equal(GAME_ERROR_TYPE.ACTIVE_GAME);
    expect(error.message).to.equal('Game already in progress');
  });

  it('should add repository name', () => {
    const error = new GameError({
      type: GAME_ERROR_TYPE.NOT_FOUND,
      message: 'Resource not found'
    });

    error.addRepository('TestRepo');
    expect(error.repository).to.equal('TestRepo');
  });
});
