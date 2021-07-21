import { User } from '../../../../../../models';
import { findPlayerByUser, findPlayersByGame } from '../../../../../../models/ArenaPlayer';
import { findSinglePlayerPerformance } from '../../../../../../models/ArenaPlayerPerformance';
import { setPlayerRoundAction } from '../../../../../../models/ArenaRoundAction';
import { findActiveArenaZones } from '../../../../../../models/ArenaZone';
import { findItemByName } from '../../../../../../models/Item';
import { ITEM_TYPE, ZERO } from '../../../../../consts/global';
import { GameResponse, getGameResponse } from '../../../../../utils';
import { ARENA_ACTIONS, MAX_PLAYER_HEALTH } from '../../../../consts';
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

export async function reviveSelf(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      const actionBlockkit = generateActionsBlockKit(player, arenaCommandReply.zoneNeeded());
      return getGameResponse(actionBlockkit);
    }
    const healthKit = await findItemByName(ITEM_TYPE.HEALTH_KIT, ITEM_TYPE.HEALTH_KIT, transaction);
    const healthKitQty = healthKit ? player.healthkitQty(healthKit.id) : ZERO;

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

    if (healthKitQty <= ZERO) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNeedsHealthKit()
      );
      return getGameResponse(actionBlockkit);
    }
    if (player.health === MAX_PLAYER_HEALTH) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerHealsSelfMaxed()
      );
      return getGameResponse(actionBlockkit);
    }
    await setPlayerRoundAction(
      player,
      round,
      { id: ARENA_ACTIONS.REVIVE, targetPlayerId: player.id },
      transaction
    );
    const playerWillBeVisible = round.isEveryoneVisible ? true : player.isVisible;
    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const changeLocationParams = {
      player,
      arenaZonesAvailable,
    };
    return getGameResponse(
      arenaCommandReply.playerHealsSelf(
        changeLocationParams,
        playerWillBeVisible,
        healthKit?._healthkit?.healingPower ?? ZERO
      )
    );
  });
}

export async function completeRevive(userRequesting: User, selectedTargetId: number) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      const actionBlockkit = generateActionsBlockKit(player, arenaCommandReply.zoneNeeded());
      return getGameResponse(actionBlockkit);
    }

    const targetPlayer = await findPlayerByUser(
      round._gameId,
      selectedTargetId,
      false,
      transaction
    );

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

    if (!targetPlayer || !targetPlayer._user || !targetPlayer._user.slackId) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNotInTheGame()
      );
      return getGameResponse(actionBlockkit);
    }

    const targetPlayerSlackId = targetPlayer._user.slackId;
    const isSelf = player.id === targetPlayer.id;

    if (targetPlayer.health === MAX_PLAYER_HEALTH) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        isSelf
          ? arenaCommandReply.playerHealsSelfMaxed()
          : arenaCommandReply.playerHealsSomebodyMaxed(targetPlayerSlackId)
      );
      return getGameResponse(actionBlockkit);
    }

    const healthKit = await findItemByName(ITEM_TYPE.HEALTH_KIT, ITEM_TYPE.HEALTH_KIT, transaction);
    const healthKitQty = healthKit ? player.healthkitQty(healthKit.id) : ZERO;
    if (healthKitQty <= ZERO) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNeedsHealthKit()
      );
      return getGameResponse(actionBlockkit);
    }

    await setPlayerRoundAction(
      player,
      round,
      { id: ARENA_ACTIONS.REVIVE, targetPlayerId: targetPlayer.id },
      transaction
    );
    const playerWillBeVisible = round.isEveryoneVisible ? true : player.isVisible;
    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const changeLocationParams = {
      player,
      arenaZonesAvailable,
    };

    return getGameResponse(
      isSelf
        ? arenaCommandReply.playerHealsSelf(
            changeLocationParams,
            playerWillBeVisible,
            healthKit?._healthkit?.healingPower ?? ZERO
          )
        : arenaCommandReply.playerHealsSomebody(
            changeLocationParams,
            targetPlayerSlackId,
            playerWillBeVisible,
            healthKit?._healthkit?.healingPower ?? ZERO
          )
    );
  });
}

export async function reviveOther(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      const actionBlockkit = generateActionsBlockKit(player, arenaCommandReply.zoneNeeded());
      return getGameResponse(actionBlockkit);
    }
    const healthKit = await findItemByName(ITEM_TYPE.HEALTH_KIT, ITEM_TYPE.HEALTH_KIT, transaction);
    const healthKitQty = healthKit ? player.healthkitQty(healthKit.id) : ZERO;

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

    if (healthKitQty <= ZERO) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNeedsHealthKit()
      );
      return getGameResponse(actionBlockkit);
    }

    const allPlayers = await findPlayersByGame(round._gameId, false, transaction);
    const playersToDropdown = allPlayers.filter(
      (p) =>
        p.id !== player.id &&
        zone._players?.find((zonePlayer) => zonePlayer.id === p.id) &&
        !p.isSpectator
    );
    const slackBlocks = generateTargetPickerBlock(playersToDropdown, 'reviveother');
    return getGameResponse(slackBlocks);
  });
}
