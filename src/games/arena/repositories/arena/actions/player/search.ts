import type { User } from '../../../../../../models';
import { findSinglePlayerPerformance } from '../../../../../../models/ArenaPlayerPerformance';
import { setPlayerRoundAction } from '../../../../../../models/ArenaRoundAction';
import { findActiveArenaZones } from '../../../../../../models/ArenaZone';
import type { GameResponse } from '../../../../../utils';
import { getGameResponse } from '../../../../../utils';
import { ARENA_ACTIONS } from '../../../../consts';
import { generateArenaActionsBlockKit } from '../../../../generators/gameplay';
import type { PlayerActionsDeadOrAlive } from '../../../../utils';
import { playerActionsParams, withArenaTransaction } from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function searchForWeapons(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const arenaZonesAvailable = await findActiveArenaZones(transaction);

    const { player, round } = playerActions as PlayerActionsDeadOrAlive;
    await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.SEARCH_WEAPONS }, transaction);

    return getGameResponse(
      arenaCommandReply.playerSearchesForItem(ARENA_ACTIONS.SEARCH_WEAPONS, {
        player,
        arenaZonesAvailable,
      })
    );
  });
}

export async function searchForArmors(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const arenaZonesAvailable = await findActiveArenaZones(transaction);

    const { player, round } = playerActions as PlayerActionsDeadOrAlive;
    await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.SEARCH_ARMOR }, transaction);

    return getGameResponse(
      arenaCommandReply.playerSearchesForItem(ARENA_ACTIONS.SEARCH_ARMOR, {
        player,
        arenaZonesAvailable,
      })
    );
  });
}

export async function searchForHealth(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;
    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const playerHasHealthkit = player.hasMaxHealthkits();

    if (!zone) {
      const actionBlockkit = generateArenaActionsBlockKit(player, arenaCommandReply.zoneNeeded());
      return getGameResponse(actionBlockkit);
    }

    if (playerHasHealthkit) {
      const playerPerformance = await findSinglePlayerPerformance(
        player.id,
        round._gameId,
        transaction
      );
      const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

      const actionBlockkit = generateArenaActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerCannotCarryMoreHealthkits()
      );
      return getGameResponse(actionBlockkit);
    }

    await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.SEARCH_HEALTH }, transaction);

    return getGameResponse(
      arenaCommandReply.playerSearchesForItem(ARENA_ACTIONS.SEARCH_HEALTH, {
        player,
        arenaZonesAvailable,
      })
    );
  });
}
