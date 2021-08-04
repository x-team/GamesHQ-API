import { random } from 'lodash';
import { User } from '../../../../../../models';
import { findPlayerByUser } from '../../../../../../models/ArenaPlayer';
import { findSinglePlayerPerformance } from '../../../../../../models/ArenaPlayerPerformance';
import {
  findPlayerRoundAction,
  setPlayerRoundAction,
} from '../../../../../../models/ArenaRoundAction';
import { findActiveArenaZones } from '../../../../../../models/ArenaZone';
import { findWeaponById } from '../../../../../../models/ItemWeapon';
import { ONE, TRAIT } from '../../../../../consts/global';
import { GameResponse, getGameResponse } from '../../../../../utils';
import { generateGenericWeaponPickerBlock } from '../../../../../utils/generators/games';
import { ARENA_ACTIONS, ARENA_SECONDARY_ACTIONS } from '../../../../consts';
import {
  generateActionsBlockKit,
  generateTargetPickerBlock,
} from '../../../../generators/gameplay';
import {
  generateTargetGroup,
  PlayerActionsDeadOrAlive,
  playerActionsParams,
  withArenaTransaction,
} from '../../../../utils';
import { randomizeItems } from '../../../../utils/rollRarity';
import { arenaCommandReply } from '../../replies';

export async function hunt(userRequesting: User) {
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

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);
    const weapons = player.itemsAvailable(player._weapons);
    const weaponQty = weapons.length;

    // find player's group
    const targetGroup = generateTargetGroup(
      player,
      zone._players ?? [],
      !!round._game?._arena?.teamBased
    );

    if (targetGroup.length === 0) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.noTargetsAvailable()
      );
      return getGameResponse(actionBlockkit);
    }

    let mutableVisiblePlayers = targetGroup.filter((p) => p.isCurrentlyVisible());

    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const changeLocationParams = {
      action: ARENA_ACTIONS.SEARCH_WEAPONS,
      player,
      arenaZonesAvailable,
    };
    if (player.isBoss) {
      await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.HUNT }, transaction);
      const playerWillBeVisible = round.isEveryoneVisible ? true : player.isVisible;
      if (targetGroup.length === 0) {
        return getGameResponse(
          arenaCommandReply.bossHuntsPlayers(changeLocationParams, playerWillBeVisible)
        );
      } else {
        // select random target from group
        if (!mutableVisiblePlayers.length) {
          const actionBlockkit = generateActionsBlockKit(
            player,
            hud,
            arenaCommandReply.noTargetsVisibleButPresent(targetGroup.length, zone)
          );
          return getGameResponse(actionBlockkit);
        }

        const randomTarget = mutableVisiblePlayers[random(mutableVisiblePlayers.length - ONE)];
        await setPlayerRoundAction(
          player,
          round,
          { id: ARENA_ACTIONS.HUNT, targetPlayerId: randomTarget.id },
          transaction
        );
        const slackBlocks = generateTargetPickerBlock(
          mutableVisiblePlayers,
          'hunt',
          arenaCommandReply.playerChooseTarget(
            zone,
            targetGroup.length - mutableVisiblePlayers.length
          )
        );
        return getGameResponse(slackBlocks);
      }
    }

    if (weaponQty === 0) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNeedsWeapon(player)
      );
      return getGameResponse(actionBlockkit);
    }

    if (weaponQty > 1) {
      // select random target from group
      const randomWeapon = randomizeItems(player._weapons!);

      const slackBlocks = generateGenericWeaponPickerBlock(
        arenaCommandReply.playerChooseWeapon(),
        player._weapons!,
        randomWeapon,
        ARENA_SECONDARY_ACTIONS.HUNT_CHOOSE_WEAPON
      );
      return getGameResponse(slackBlocks);
    } else {
      const weapon = player._weapons![0];

      if (!weapon.hasTrait(TRAIT.STEALTH)) {
        await player.setVisibility(true, transaction);
      }

      mutableVisiblePlayers = weapon?.hasTrait(TRAIT.DETECT)
        ? targetGroup
        : targetGroup.filter((p) => p.isCurrentlyVisible());
      if (!mutableVisiblePlayers.length) {
        const actionBlockkit = generateActionsBlockKit(
          player,
          hud,
          arenaCommandReply.noTargetsVisibleButPresent(targetGroup.length, zone)
        );
        return getGameResponse(actionBlockkit);
      }

      await setPlayerRoundAction(
        player,
        round,
        { id: ARENA_ACTIONS.HUNT, weaponId: weapon.id },
        transaction
      );
      const playerWillBeVisible = round.isEveryoneVisible ? true : player.isVisible;
      if (targetGroup.length === 0) {
        return getGameResponse(
          arenaCommandReply.playerHuntsPlayers(changeLocationParams, weapon, playerWillBeVisible)
        );
      } else {
        // select random target from group
        const randomTarget = mutableVisiblePlayers[random(mutableVisiblePlayers.length - ONE)];
        await setPlayerRoundAction(
          player,
          round,
          { id: ARENA_ACTIONS.HUNT, weaponId: weapon.id, targetPlayerId: randomTarget.id },
          transaction
        );
        const slackBlocks = generateTargetPickerBlock(
          mutableVisiblePlayers,
          'hunt',
          arenaCommandReply.playerChooseTarget(
            zone,
            targetGroup.length - mutableVisiblePlayers.length
          )
        );
        return getGameResponse(slackBlocks);
      }
    }
  });
}

export async function chooseWeapon(userRequesting: User, selectedWeapon: number, action: string) {
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

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);
    const weapon = await findWeaponById(selectedWeapon, transaction);

    if (!weapon?.hasTrait(TRAIT.STEALTH)) {
      await player.setVisibility(true, transaction);
    }
    // find player's group
    const targetGroup = generateTargetGroup(
      player,
      zone._players ?? [],
      !!round._game?._arena?.teamBased
    );

    const visiblePlayers = weapon?.hasTrait(TRAIT.DETECT)
      ? targetGroup
      : targetGroup.filter((p) => p.isCurrentlyVisible());
    if (!visiblePlayers.length) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.noTargetsVisibleButPresent(targetGroup.length, zone)
      );
      return getGameResponse(actionBlockkit);
    }

    if (visiblePlayers.length > 0) {
      const randomTarget = visiblePlayers[random(visiblePlayers.length - ONE)];

      await setPlayerRoundAction(
        player,
        round,
        { id: ARENA_ACTIONS.HUNT, weaponId: selectedWeapon, targetPlayerId: randomTarget.id },
        transaction
      );

      const slackBlocks = generateTargetPickerBlock(
        visiblePlayers,
        action,
        arenaCommandReply.playerChooseTarget(zone, targetGroup.length - visiblePlayers.length)
      );
      return getGameResponse(slackBlocks);
    } else {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.noTargetsAvailable()
      );
      return getGameResponse(actionBlockkit);
    }
  });
}

export async function chooseTarget(userRequesting: User, selectedTargetId: number) {
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
    const isBoss = player.isBoss;
    const roundAction = await findPlayerRoundAction(player.id, round.id, transaction);

    if (!roundAction) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerDoesntHaveAction()
      );
      return getGameResponse(actionBlockkit);
    }

    if (!targetPlayer) {
      const actionBlockkit = generateActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerNotInTheGame()
      );
      return getGameResponse(actionBlockkit);
    }

    const actionJson = roundAction.actionJSON;
    const weapon = await findWeaponById(actionJson.weaponId!, transaction);
    if (!isBoss && weapon && !weapon.hasTrait(TRAIT.STEALTH)) {
      await player.setVisibility(true, transaction);
    }
    await setPlayerRoundAction(
      player,
      round,
      { ...actionJson, targetPlayerId: targetPlayer.id },
      transaction
    );
    const playerWillBeVisible = round.isEveryoneVisible ? true : player.isVisible;
    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const changeLocationParams = {
      player,
      arenaZonesAvailable,
    };
    if (isBoss) {
      return getGameResponse(
        arenaCommandReply.bossHuntsPlayers(changeLocationParams, playerWillBeVisible)
      );
    }
    return getGameResponse(
      arenaCommandReply.playerHuntsPlayers(changeLocationParams, weapon!, playerWillBeVisible)
    );
  });
}
