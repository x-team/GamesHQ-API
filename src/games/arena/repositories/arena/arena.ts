import { logger } from '../../../../config';
import { User } from '../../../../models';
import { findActiveArenaGame, startArenaGame } from '../../../../models/ArenaGame';
import { findLivingPlayersByGame } from '../../../../models/ArenaPlayer';
import { activateAllArenaZones } from '../../../../models/ArenaZone';
import { enableAllItems } from '../../../../models/GameItemAvailability';
import { GAME_TYPE } from '../../../consts/global';
import {
  adminAction,
  GameResponse,
  generateRandomNameForGame,
  getGameError,
  getGameResponse,
} from '../../../utils';
import { generateArenaEndGameConfirmationBlockKit } from '../../generators';
import { publishArenaMessage, withArenaTransaction } from '../../utils';
import { ArenaEngine } from './engine';
import { arenaCommandReply } from './replies';

export class ArenaRepository {
  readonly name: string = 'arena-repository';
  constructor(public arenaGameEngine: ArenaEngine) {}
  // PLAYERS ///////////////////////////////////////////////////////////////////

  // ADMINS ///////////////////////////////////////////////////////////////////
  async newGame(commandText: string, userRequesting: User): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      try {
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

        await enableAllItems(GAME_TYPE.ARENA, transaction);
        await activateAllArenaZones(transaction);
        return getGameResponse(arenaCommandReply.adminCreatedGame(game));
      } catch (e) {
        logger.error('Hello error :D');
        throw e;
        // throw GameError({
        //   message: e.message,
        //   repository: ArenaRepository.name,
        // })
      }
    });
  }

  async askEndGame(userRequesting: User): Promise<void | GameResponse> {
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

  async endGame(userRequesting: User): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      await enableAllItems(GAME_TYPE.ARENA, transaction);
      await game.endGame(transaction);
      await activateAllArenaZones(transaction);
      await publishArenaMessage(arenaCommandReply.channelEndGame(game), true);
      return getGameResponse(arenaCommandReply.adminEndedGame(game));
    });
  }

  async cancelEndGame(userRequesting: User): Promise<void | GameResponse> {
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

  async listPlayers(userRequesting: User): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);

      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }

      const playersAlive = await findLivingPlayersByGame(game.id, false, transaction);
      await publishArenaMessage(arenaCommandReply.channelDisplayPlayersInfo(playersAlive), true);
      return getGameResponse(arenaCommandReply.adminPlayersInfoPosted());
    });
  }
}
