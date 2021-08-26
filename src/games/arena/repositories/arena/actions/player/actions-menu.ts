import { User } from '../../../../../../models';
import { findSinglePlayerPerformance } from '../../../../../../models/ArenaPlayerPerformance';
import { GameResponse, getGameError, getGameResponse } from '../../../../../utils';
import { generateArenaActionsBlockKit } from '../../../../generators/gameplay';
import {
  PlayerActionsDeadOrAlive,
  playerActionsParams,
  withArenaTransaction,
} from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function actionsMenu(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, false, transaction);

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
    return getGameResponse(generateArenaActionsBlockKit(player, hud));
  });
}

export async function status(userRequesting: User) {
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
    const cheersReceived = playerPerformance?.cheersReceived ?? 0;
    return getGameResponse(
      generateArenaActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerStatus(player, cheersReceived)
      )
    );
  });
}
