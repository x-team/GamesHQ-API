export enum GAME_ERROR_TYPE {
  NOT_FOUND = 'NOT_FOUND',
  ACTIVE_GAME = 'ACTIVE_GAME',
  // ... other error types
}

export class GameError extends Error {
  type: GAME_ERROR_TYPE;
  repository?: string;

  constructor({ type, message }: { type: GAME_ERROR_TYPE; message: string }) {
    super(message);
    this.type = type;
  }

  static notFound(message: string): GameError {
    return new GameError({
      type: GAME_ERROR_TYPE.NOT_FOUND,
      message,
    });
  }

  static activeGameRunning(message: string): GameError {
    return new GameError({
      type: GAME_ERROR_TYPE.ACTIVE_GAME,
      message,
    });
  }

  addRepository(repositoryName: string) {
    this.repository = repositoryName;
  }
}
