import type { User } from '../../../../../../models';
import { findActiveArenaGame, startArenaGame } from '../../../../../../models/ArenaGame';
import { endActiveRound } from '../../../../../../models/ArenaRound';
import { activateAllArenaZones } from '../../../../../../models/ArenaZone';
import { enableAllItems } from '../../../../../../models/GameItemAvailability';
import { GAME_TYPE } from '../../../../../consts/global';
import {
  adminAction,
  generateRandomNameForGame,
  getGameError,
  getGameResponse,
} from '../../../../../utils';
import { generateArenaEndGameConfirmationBlockKit } from '../../../../generators/gameplay';
import { publishArenaMessage, withArenaTransaction } from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function newGame(commandText: string, userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const teamBasedText = 'team based';
    const teamBasedTextNoSpaces = teamBasedText.replace(' ', '');
    const lowerCaseCommandText = commandText.toLowerCase();
    const isTeamBased =
      lowerCaseCommandText.includes(teamBasedText) ||
      lowerCaseCommandText.includes(teamBasedTextNoSpaces);
    const gameName = lowerCaseCommandText
      .replace(teamBasedText, '')
      .replace(teamBasedTextNoSpaces, '')
      .trim();
    const game = await startArenaGame(
      {
        name: gameName === '' ? generateRandomNameForGame(GAME_TYPE.ARENA) : gameName,
        _createdById: userRequesting.id,
        teamBased: isTeamBased,
      },
      transaction
    );

    await enableAllItems(game._gameTypeId, transaction);
    return getGameResponse(arenaCommandReply.adminCreatedGame(game));
  });
}

export async function askEndGame(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const game = await findActiveArenaGame(transaction);
    if (!game) {
      return getGameError(arenaCommandReply.noActiveGame());
    }
    const endGameConfirmBlock = generateArenaEndGameConfirmationBlockKit();
    return getGameResponse(endGameConfirmBlock);
  });
}

export async function endGame(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const game = await findActiveArenaGame(transaction);
    if (!game) {
      return getGameError(arenaCommandReply.noActiveGame());
    }
    await enableAllItems(game._gameTypeId, transaction);
    await endActiveRound(transaction);
    await game.endGame(transaction);
    await activateAllArenaZones(transaction);
    await publishArenaMessage(arenaCommandReply.channelEndGame(game), true);
    return getGameResponse(arenaCommandReply.adminEndedGame(game));
  });
}

export async function cancelEndGame(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const game = await findActiveArenaGame(transaction);
    if (!game) {
      return getGameError(arenaCommandReply.noActiveGame());
    }
    return getGameResponse(arenaCommandReply.cancelEndGame());
  });
}

export async function toggleZoneDeactivationSystem(userRequesting: User, isEnable: boolean) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const game = await findActiveArenaGame(transaction);
    if (!game) {
      return getGameError(arenaCommandReply.noActiveGame());
    }
    await game._arena?.toggleZoneDeactivation(isEnable, transaction);
    return getGameResponse(arenaCommandReply.adminToggleZoneDeactivation(isEnable));
  });
}
