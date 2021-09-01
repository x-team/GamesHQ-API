import type { Transaction } from 'sequelize';
import { TowerRound, TowerRoundAction } from '../../../../../models';
import { TOWER_ACTIONS } from '../../../consts';
import { filterActionsById } from '../../../utils';
import { awardPrize } from './helpers/award-prize';
import { generateEnemiesActions } from './helpers/generate-enemies-actions';
import { generateLoot } from './helpers/generate-loot';
import { generatePerksAndItem } from './helpers/generate-perks-and-items';
import { processSearchHealth } from './processSearchHealth';

export class TowerEngine {
  static getInstance(): TowerEngine {
    if (!TowerEngine.instance) {
      TowerEngine.instance = new TowerEngine();
    }

    return TowerEngine.instance;
  }

  private static instance: TowerEngine;

  private constructor() {}

  public awardPrize = awardPrize.bind(this);

  public generateEnemiesActions = generateEnemiesActions.bind(this);

  public generateLoot = generateLoot.bind(this);

  public generatePerksAndItem = generatePerksAndItem.bind(this);

  async runRound(_round: TowerRound, actions: TowerRoundAction[], transaction: Transaction) {
    // const raidersToNotify = await findRaidersByFloorBattlefield(
    //   round._towerFloorBattlefieldId,
    //   false,
    //   transaction
    // );

    await this.processSearchHealth(
      filterActionsById(actions, TOWER_ACTIONS.SEARCH_HEALTH),
      transaction
    );

    // await this.processHealOrRevive(
    //   round,
    //   filterActionsById(actions, TOWER_ACTIONS.REVIVE),
    //   transaction
    // );

    // await this.processLuckElixirUse(
    //   round,
    //   filterActionsById(actions, TOWER_ACTIONS.LUCK_ELIXIR),
    //   transaction
    // );

    // await this.processHide(
    //   filterActionsById(actions, TOWER_ACTIONS.HIDE),
    //   raidersToNotify,
    //   transaction
    // );

    // await this.processSearchArmors(
    //   round,
    //   filterActionsById(actions, TOWER_ACTIONS.SEARCH_ARMOR),
    //   transaction
    // );

    // await this.processSearchWeapons(
    //   round,
    //   filterActionsById(actions, TOWER_ACTIONS.SEARCH_WEAPONS),
    //   transaction
    // );

    // await this.processCharge(
    //   filterActionsById(actions, TOWER_ACTIONS.CHARGE),
    //   raidersToNotify,
    //   transaction
    // );

    // await this.processHunt(
    //   round,
    //   filterActionsById(actions, TOWER_ACTIONS.HUNT),
    //   raidersToNotify,
    //   transaction
    // );
  }

  // SEARCH OPERATIONS /////////////////////////////////////////////////
  private processSearchHealth = processSearchHealth.bind(this);
  // private processSearchArmors = processSearchArmors.bind(this);
  // private processSearchWeapons = processSearchWeapons.bind(this);

  // HEAL OR REVIVE OPERATIONS /////////////////////////////////////////////////
  // private processHealOrRevive = processHealOrRevive.bind(this);

  // HIDE OPERATIONS /////////////////////////////////////////////////
  // private processHide = processHide.bind(this);

  // HUNT OPERATIONS /////////////////////////////////////////////////
  // private processHunt = processHunt.bind(this);

  // CHARGE OPERATIONS /////////////////////////////////////////////////
  // private processCharge = processCharge.bind(this);

  // RING SYSTEM OPERATIONS /////////////////////////////////////////////////
  // private processRingSystemPenalty = processRingSystemPenalty.bind(this);
}
