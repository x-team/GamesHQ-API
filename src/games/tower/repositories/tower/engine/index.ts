export class TowerEngine {
  static getInstance(): TowerEngine {
    if (!TowerEngine.instance) {
      TowerEngine.instance = new TowerEngine();
    }

    return TowerEngine.instance;
  }

  private static instance: TowerEngine;

  private constructor() {}
}
