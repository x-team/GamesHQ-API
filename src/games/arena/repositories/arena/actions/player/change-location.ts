import type { User } from '../../../../../../models';
import { findSinglePlayerPerformance } from '../../../../../../models/ArenaPlayerPerformance';
import {
  findPlayerRoundAction,
  setPlayerRoundAction,
} from '../../../../../../models/ArenaRoundAction';
import { findActiveArenaZones, findArenaZoneById } from '../../../../../../models/ArenaZone';
import type { GameResponse } from '../../../../../utils';
import { getGameError, getGameResponse } from '../../../../../utils';
import { ARENA_ACTIONS } from '../../../../consts';
import { generateArenaActionsBlockKit } from '../../../../generators/gameplay';
import type { PlayerActionsDeadOrAlive } from '../../../../utils';
import { playerActionsParams, withArenaTransaction } from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function changeLocation(userRequesting: User, arenaZoneId: number) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);

    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }

    const { zone, player, round } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      return getGameError(arenaCommandReply.zoneNeeded());
    }

    const roundAction = await findPlayerRoundAction(player.id, round.id, transaction);
    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

    if (!roundAction) {
      const actionBlockkit = generateArenaActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerDoesntHaveAction()
      );
      return getGameResponse(actionBlockkit);
    }

    const actionJson = roundAction.actionJSON;
    const arenaZoneToMove = await findArenaZoneById(arenaZoneId, transaction);

    if (!arenaZoneToMove) {
      const actionBlockkit = generateArenaActionsBlockKit(
        player,
        hud,
        arenaCommandReply.zoneNotFound()
      );
      return getGameResponse(actionBlockkit);
    }

    const playerWillMove = player._arenaZoneId !== arenaZoneToMove.id;
    if (playerWillMove) {
      await setPlayerRoundAction(
        player,
        round,
        { ...actionJson, locationId: arenaZoneId },
        transaction
      );
    }
    return getGameResponse(arenaCommandReply.playerLocation(playerWillMove, arenaZoneToMove));
  });
}

export async function bossChangeLocation(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);

    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }

    const { zone, player, round } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      return getGameError(arenaCommandReply.zoneNeeded());
    }

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

    if (!player.isBoss) {
      const actionBlockkit = generateArenaActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNotABoss()
      );
      return getGameResponse(actionBlockkit);
    }

    await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.STAY_ON_LOCATION }, transaction);

    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const changeLocationParams = {
      player,
      arenaZonesAvailable,
    };
    return getGameResponse(arenaCommandReply.bossChangesLocation(changeLocationParams));
  });
}
