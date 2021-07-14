import { isEmpty } from 'lodash';

import type { User } from '../../../../models';
import {
  findActiveArenaGame,
  findLastActiveArenaGame,
  startArenaGame,
} from '../../../../models/ArenaGame';
import {
  addArenaPlayers,
  addArenaPlayersToZones,
  findLivingPlayersByGame,
  findPlayerByUser,
  findPlayersByGame,
  findSpectatorsByGame,
  getOrCreateBossesOrGuests,
  removePlayersFromArenaZones,
  setAllPlayerVisibility,
} from '../../../../models/ArenaPlayer';
import {
  findFirstBlood,
  findPlayersPerformanceByAction,
} from '../../../../models/ArenaPlayerPerformance';
import { findActiveRound } from '../../../../models/ArenaRound';
import { removeActionFromRound } from '../../../../models/ArenaRoundAction';
import { activateAllArenaZones } from '../../../../models/ArenaZone';
import { enableAllItems } from '../../../../models/GameItemAvailability';
import { getUserBySlackId } from '../../../../models/User';
import { parseEscapedSlackUserValues } from '../../../../utils/slack';
import { GAME_TYPE } from '../../../consts/global';
import { generateTeamEmoji } from '../../../helpers';
import type { GameResponse } from '../../../utils';
import {
  adminAction,
  generateRandomNameForGame,
  getGameError,
  getGameResponse,
  parseCommandTextToSlackIds,
} from '../../../utils';
import {
  ARENA_PLAYER_PERFORMANCE,
  MAX_BOSS_HEALTH,
  MAX_TOP_OUTSTANDING_PERFORMANCE,
  BOSS_HEALTHKIT_HEALING,
  ARENA_ACTIONS,
} from '../../consts';
import { generateArenaEndGameConfirmationBlockKit } from '../../generators';
import {
  parseRevivePlayerCommandText,
  publishArenaMessage,
  topPlayerPerformance,
  withArenaTransaction,
} from '../../utils';
import { addPlayers, addSpectator, parseBossAndGuestCommandText } from '../../utils/addPlayer';

import type { ArenaEngine } from './engine';
import {
  arenaCommandReply,
  generatePlayerPerformanceActionHeader,
  notifyPlayersWhoWantedToHide,
  PLAYER_PERFORMANCE_HEADER,
} from './replies';

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

  async reviveBoss(commandText: string, userRequesting: User): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const targetSlackId = parseRevivePlayerCommandText(commandText);
      const round = await findActiveRound(true, transaction);
      if (!round) {
        return getGameError(arenaCommandReply.noActiveRound());
      }
      if (!targetSlackId) {
        return getGameError(arenaCommandReply.noSlackIdProvided());
      }
      const targetUser = await getUserBySlackId(targetSlackId);

      if (!targetUser) {
        return getGameError(arenaCommandReply.userNotFound(targetSlackId));
      }

      const targetBossPlayer = await findPlayerByUser(
        round._gameId,
        targetUser.id,
        false,
        transaction
      );

      if (!targetBossPlayer) {
        return getGameError(arenaCommandReply.playerNotInTheGame());
      }

      if (!targetBossPlayer.isBoss) {
        return getGameError(arenaCommandReply.playerIsNotBoss(targetBossPlayer._user?.slackId!));
      }

      if (targetBossPlayer.health === MAX_BOSS_HEALTH) {
        return getGameError(arenaCommandReply.playerHealsSomebodyMaxed(targetSlackId));
      }
      await targetBossPlayer.reviveOrHeal(BOSS_HEALTHKIT_HEALING, MAX_BOSS_HEALTH, transaction);
      await publishArenaMessage(
        arenaCommandReply.channelBossRevived(targetSlackId, targetBossPlayer.health),
        true
      );
      return getGameResponse(arenaCommandReply.adminRevivedBoss(targetSlackId));
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

  async makeAllVisible(channelId: string, userRequesting: User): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const round = await findActiveRound(true, transaction);
      if (!round) {
        return getGameError(arenaCommandReply.noActiveRound());
      }
      await round.makeEveryoneVisible(transaction);
      await setAllPlayerVisibility(round._gameId, true, transaction);
      await publishArenaMessage(arenaCommandReply.channelAllVisible(), true);
      await notifyPlayersWhoWantedToHide(round.id, channelId);
      await removeActionFromRound(round.id, ARENA_ACTIONS.HIDE, transaction);
      return getGameResponse(arenaCommandReply.adminMadeAllVisible());
    });
  }

  async performance(userRequesting: User): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (game) {
        return getGameError(arenaCommandReply.activeGame());
      }
      const lastGame = await findLastActiveArenaGame(transaction);
      if (!lastGame) {
        return getGameError(arenaCommandReply.noLastGame());
      }
      const firstBloodPerformance = await findFirstBlood(lastGame.id, transaction);
      const firstBloodHeader = PLAYER_PERFORMANCE_HEADER.FIRST_BLOOD;
      const firstBloodMessage =
        `\t1. ${generateTeamEmoji(firstBloodPerformance?._player?._user?._team?.emoji)} ` +
        `| <@${firstBloodPerformance?._player?._user?.slackId}>`;
      let mutableTopRankings = `${firstBloodHeader}\n${firstBloodMessage}`;
      for (const performanceField of Object.values(ARENA_PLAYER_PERFORMANCE)) {
        const playersPerformance = await findPlayersPerformanceByAction(
          lastGame.id,
          performanceField,
          transaction
        );
        if (playersPerformance) {
          const rankingHeader = generatePlayerPerformanceActionHeader(performanceField);
          const top = topPlayerPerformance(
            MAX_TOP_OUTSTANDING_PERFORMANCE,
            performanceField,
            playersPerformance
          );
          mutableTopRankings += `${rankingHeader}\n${top}`;
        }
      }
      await publishArenaMessage(
        arenaCommandReply.channelListOutstandingPerformance(mutableTopRankings),
        true
      );
      // Clean Arena Zones
      const allPlayers = await findPlayersByGame(lastGame.id, false, transaction);
      await removePlayersFromArenaZones(allPlayers, transaction);
      return getGameResponse('Outstanding Performance displayed');
    });
  }
}
