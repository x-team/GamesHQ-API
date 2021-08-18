import { User } from '../../../../../../models';
import {
  findPlayerById,
  findPlayerByUser,
  findPlayersByGame,
} from '../../../../../../models/ArenaPlayer';
import { findSinglePlayerPerformance } from '../../../../../../models/ArenaPlayerPerformance';
import {
  findPlayerActionsByGame,
  setPlayerRoundAction,
} from '../../../../../../models/ArenaRoundAction';
import { findActiveArenaZones } from '../../../../../../models/ArenaZone';
import { GameResponse, getGameResponse } from '../../../../../utils';
import { ARENA_ACTIONS } from '../../../../consts';
import {
  generateActionsBlockKit,
  generateTargetPickerBlock,
} from '../../../../generators/gameplay';
import {
  PlayerActionsDeadOrAlive,
  playerActionsParams,
  withArenaTransaction,
} from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function cheer(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, false, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      const actionBlockkit = generateActionsBlockKit(player, arenaCommandReply.zoneNeeded());
      return getGameResponse(actionBlockkit);
    }

    const allPlayers = await findPlayersByGame(round._gameId, false, transaction);
    // You can't cheer yourself or dead players
    const filteredPlayers = allPlayers.filter((p) => p.id !== player.id && p.isAlive());
    const slackBlocks = generateTargetPickerBlock(filteredPlayers, 'cheer');
    return getGameResponse(slackBlocks);
  });
}

export async function completeCheer(userRequesting: User, selectedTargetId: number) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, false, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      const actionBlockkit = generateActionsBlockKit(player, arenaCommandReply.zoneNeeded());
      return getGameResponse(actionBlockkit);
    }

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);
    const targetPlayer = await findPlayerByUser(
      round._gameId,
      selectedTargetId,
      false,
      transaction
    );

    if (!targetPlayer) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNotInTheGame()
      );
      return getGameResponse(actionBlockkit);
    }
    const targetPlayerSlackId = targetPlayer._user?.slackId!;

    await setPlayerRoundAction(
      player,
      round,
      { id: ARENA_ACTIONS.CHEER, targetPlayerId: targetPlayer.id },
      transaction
    );
    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const changeLocationParams = {
      action: ARENA_ACTIONS.CHEER,
      player,
      arenaZonesAvailable,
    };
    return getGameResponse(
      arenaCommandReply.playerCheers(changeLocationParams, targetPlayerSlackId)
    );
  });
}

export async function repeatLastCheer(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, false, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      const actionBlockkit = generateActionsBlockKit(player, arenaCommandReply.zoneNeeded());
      return getGameResponse(actionBlockkit);
    }

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);
    const [lastCheerAction] = await findPlayerActionsByGame(
      player.id,
      round._gameId,
      ARENA_ACTIONS.CHEER,
      transaction
    );

    if (!lastCheerAction) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerDoesntHaveLastCheerAction()
      );
      return getGameResponse(actionBlockkit);
    }
    const { targetPlayerId } = lastCheerAction.actionJSON;
    const targetPlayer = await findPlayerById(targetPlayerId!, false, transaction);

    if (!targetPlayer) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNotInTheGame()
      );
      return getGameResponse(actionBlockkit);
    }

    const targetPlayerSlackId = targetPlayer._user?.slackId!;

    if (!targetPlayer.isAlive()) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerCannotCheerDeads(targetPlayerSlackId)
      );
      return getGameResponse(actionBlockkit);
    }

    await setPlayerRoundAction(
      player,
      round,
      { id: ARENA_ACTIONS.CHEER, targetPlayerId: targetPlayer.id },
      transaction
    );
    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const changeLocationParams = {
      action: ARENA_ACTIONS.CHEER,
      player,
      arenaZonesAvailable,
    };
    return getGameResponse(
      arenaCommandReply.playerCheers(changeLocationParams, targetPlayerSlackId)
    );
  });
}
