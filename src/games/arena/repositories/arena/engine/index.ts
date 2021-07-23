import type { Transaction } from 'sequelize/';
import { ArenaRound } from '../../../../../models';
import { getIdlePlayers } from '../../../../../models/ArenaPlayer';
import { setPlayerRoundAction } from '../../../../../models/ArenaRoundAction';
import { ArenaZone, findArenaZoneById } from '../../../../../models/ArenaZone';
import { ARENA_ACTIONS } from '../../../consts';
import { filterActionsById, filterActionsByZone, publishArenaMessage } from '../../../utils';
import { processChangeLocation } from './processChangeLocation';
import { processSearchArmors, processSearchHealth, processSearchWeapons } from './processSearch';
import { gameEngineReply } from './replies';

export class ArenaEngine {
  static getInstance(): ArenaEngine {
    if (!ArenaEngine.instance) {
      ArenaEngine.instance = new ArenaEngine();
    }

    return ArenaEngine.instance;
  }

  private static instance: ArenaEngine;

  private isRunningRound = false;

  private constructor() {}

  setRoundState(state: boolean) {
    this.isRunningRound = state;
  }

  getRoundState(): boolean {
    return this.isRunningRound;
  }

  async assignZoneActionToIdlePlayers(round: ArenaRound, transaction: Transaction) {
    const idlePlayers = await getIdlePlayers(round._gameId, round._actions || [], transaction);
    await Promise.all(
      idlePlayers.map(async (player) => {
        const zone = await findArenaZoneById(player._arenaZoneId!, transaction);
        if (zone && !zone.isActive && zone.name !== 'Streaming Zone') {
          await setPlayerRoundAction(
            player,
            round,
            { id: ARENA_ACTIONS.STAY_ON_LOCATION, locationId: player._arenaZoneId! },
            transaction
          );
        }
      })
    );
  }

  async runRound(zone: ArenaZone, round: ArenaRound, transaction: Transaction) {
    const actions = filterActionsByZone(round._actions!, zone.id);
    if (actions.length) {
      const WAIT_BETWEEN_ZONES_MILLIS = 2500;
      // Wait 3 seconds to post the next zone
      await new Promise((resolve) => {
        setTimeout(resolve, WAIT_BETWEEN_ZONES_MILLIS);
      });
      await publishArenaMessage(gameEngineReply.areaReport(zone));
    }
    if (!zone.isActive && zone.name !== 'Streaming Zone') {
      // await this.processRingSystemPenalty(
      //   round._game?.inactiveZonePenaltyPower!,
      //   actions,
      //   transaction
      // );
    }

    await this.processSearchHealth(
      filterActionsById(actions, ARENA_ACTIONS.SEARCH_HEALTH),
      transaction
    );
    //   await this.processHealOrRevive(
    //     round,
    //     filterActionsById(actions, ARENA_ACTIONS.REVIVE),
    //     transaction
    //   );
    await this.processSearchArmors(
      filterActionsById(actions, ARENA_ACTIONS.SEARCH_ARMOR),
      transaction
    );
    //   await this.processHide(filterActionsById(actions, ARENA_ACTIONS.HIDE), transaction);
    await this.processSearchWeapons(
      round,
      filterActionsById(actions, ARENA_ACTIONS.SEARCH_WEAPONS),
      transaction
    );
    //   await this.processHunt(round, filterActionsById(actions, ARENA_ACTIONS.HUNT), transaction);
    //   await this.processCheers(round, filterActionsById(actions, ARENA_ACTIONS.CHEER), transaction);
  }

  // SEARCH OPERATIONS /////////////////////////////////////////////////
  private processSearchHealth = processSearchHealth.bind(this);
  private processSearchArmors = processSearchArmors.bind(this);
  private processSearchWeapons = processSearchWeapons.bind(this);

  // CHANGE LOCATION OPERATIONS /////////////////////////////////////////////////
  public processChangeLocation = processChangeLocation.bind(this);

  // HEAL OR REVIVE OPERATIONS /////////////////////////////////////////////////
  // private processChangeLocation = processChangeLocation.bind(this);

  // HIDE OPERATIONS /////////////////////////////////////////////////
  // private processChangeLocation = processChangeLocation.bind(this);

  // HUNT OPERATIONS /////////////////////////////////////////////////
  // private processChangeLocation = processChangeLocation.bind(this);

  // CHEER OPERATIONS /////////////////////////////////////////////////
  // private processChangeLocation = processChangeLocation.bind(this);
}
