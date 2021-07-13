enum GAME_ERROR_TYPE {
  NOT_FOUND = 'NOT_FOUND',
  ACTIVE_GAME = 'ACTIVE_GAME',
}

interface GameErrorAttributes {
  type: GAME_ERROR_TYPE;
  message: string;
}

export class GameError extends Error implements GameErrorAttributes {
  type: GAME_ERROR_TYPE;
  message: string;

  constructor({ type, message }: GameErrorAttributes) {
    super(message);
    Object.setPrototypeOf(this, GameError.prototype);
    this.type = type;
    this.message = message;
  }

  static notFound(message: string) {
    return new GameError({ type: GAME_ERROR_TYPE.NOT_FOUND, message });
  }

  static activeGameRunning(message: string) {
    return new GameError({ type: GAME_ERROR_TYPE.ACTIVE_GAME, message });
  }
}
