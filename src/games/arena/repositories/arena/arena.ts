import { isEmpty } from 'lodash';
import { User } from '../../../../models';
import { findActiveArenaGame, startArenaGame } from '../../../../models/ArenaGame';
import {
  addArenaPlayers,
  addArenaPlayersToZones,
  findLivingPlayersByGame,
  findSpectatorsByGame,
  getOrCreateBossesOrGuests,
} from '../../../../models/ArenaPlayer';
import { activateAllArenaZones } from '../../../../models/ArenaZone';
import { enableAllItems } from '../../../../models/GameItemAvailability';
import { parseEscapedSlackUserValues } from '../../../../utils/slack';
import { GAME_TYPE } from '../../../consts/global';
import {
  adminAction,
  GameResponse,
  generateRandomNameForGame,
  getGameError,
  getGameResponse,
  parseCommandTextToSlackIds,
} from '../../../utils';
import { generateArenaEndGameConfirmationBlockKit } from '../../generators';
import { publishArenaMessage, withArenaTransaction } from '../../utils';
import { addPlayers, addSpectator, parseBossAndGuestCommandText } from '../../utils/addPlayer';
import { ArenaEngine } from './engine';
import { arenaCommandReply } from './replies';

export class ArenaRepository {
  constructor(public arenaGameEngine: ArenaEngine) {}
  // PLAYERS ///////////////////////////////////////////////////////////////////

  // ADMINS ///////////////////////////////////////////////////////////////////
  async newGame(commandText: string, userRequesting: User): Promise<void | GameResponse> {
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

      await enableAllItems(GAME_TYPE.ARENA, transaction);
      await activateAllArenaZones(transaction);
      return getGameResponse(arenaCommandReply.adminCreatedGame(game));
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

  async addPlayer(
    commandText: string,
    userRequesting: User,
    channelId: string
  ): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      if (isEmpty(commandText)) {
        return getGameError(arenaCommandReply.noCommandTextProvided());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }

      const { uniqueSlackIds } = await addPlayers(
        commandText,
        userRequesting,
        channelId,
        transaction
      );

      return getGameResponse(arenaCommandReply.adminAddedPlayers(Array.from(uniqueSlackIds)));
    });
  }

  async addSpectator(
    commandText: string,
    userRequesting: User,
    channelId: string
  ): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      if (isEmpty(commandText)) {
        return getGameError(arenaCommandReply.noCommandTextProvided());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }

      const spectatorsAdded = await addSpectator(
        commandText,
        userRequesting,
        channelId,
        transaction
      );
      return getGameResponse(arenaCommandReply.adminAddedSpectators(spectatorsAdded));
    });
  }

  async addBossOrGuest(
    commandText: string,
    userRequesting: User,
    isBoss: boolean
  ): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      if (isEmpty(commandText)) {
        return getGameError(
          isBoss ? arenaCommandReply.noBossProvided() : arenaCommandReply.noGuestProvided()
        );
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      const [teamName, usersList] = parseBossAndGuestCommandText(commandText);

      if (game._arena?.teamBased && !teamName) {
        return getGameError(arenaCommandReply.teamNameNeeded());
      }
      const completeSlackIds = parseCommandTextToSlackIds(usersList!, false);

      const users = await getOrCreateBossesOrGuests({
        fullSlackIds: completeSlackIds,
        teamName,
        isBoss,
        transaction,
      });

      const uniqueSlackIds = new Set<string>();
      completeSlackIds.forEach((fullSlackId) =>
        uniqueSlackIds.add(parseEscapedSlackUserValues(fullSlackId) as string)
      );
      const arenaBossesOrGuests = await addArenaPlayers(
        {
          gameId: game.id,
          users,
          areBosses: isBoss,
        },
        transaction
      );
      await addArenaPlayersToZones({ arenaPlayers: arenaBossesOrGuests }, transaction);
      return getGameResponse(
        arenaCommandReply.adminAddedBossesOrGuests(Array.from(uniqueSlackIds), isBoss)
      );
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

  async listSpectators(userRequesting: User): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }

      const spectators = await findSpectatorsByGame(game.id, transaction);
      await publishArenaMessage(arenaCommandReply.channelDisplaySpectators(spectators), true);
      return getGameResponse(arenaCommandReply.adminPlayersInfoPosted());
    });
  }
}
