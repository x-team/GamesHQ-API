export class ArenaEngine {
  static getInstance(): ArenaEngine {
    if (!ArenaEngine.instance) {
      ArenaEngine.instance = new ArenaEngine();
    }

    return ArenaEngine.instance;
  }

  private static instance: ArenaEngine;

  private isRunningRound: boolean = false;

  private constructor() {}

  setRoundState(state: boolean) {
    this.isRunningRound = state;
  }

  getRoundState(): boolean {
    return this.isRunningRound;
  }
}
