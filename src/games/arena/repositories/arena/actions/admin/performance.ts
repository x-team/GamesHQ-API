import { User } from '../../../../../../models';
import { findActiveArenaGame, findLastActiveArenaGame } from '../../../../../../models/ArenaGame';
import {
  findPlayersByGame,
  removePlayersFromArenaZones,
} from '../../../../../../models/ArenaPlayer';
import {
  findFirstBlood,
  findPlayersPerformanceByAction,
} from '../../../../../../models/ArenaPlayerPerformance';
import { generateTeamEmoji } from '../../../../../helpers';
import { adminAction, getGameError, getGameResponse } from '../../../../../utils';
import { ARENA_PLAYER_PERFORMANCE, MAX_TOP_OUTSTANDING_PERFORMANCE } from '../../../../consts';
import { publishArenaMessage, topPlayerPerformance, withArenaTransaction } from '../../../../utils';
import {
  arenaCommandReply,
  generatePlayerPerformanceActionHeader,
  PLAYER_PERFORMANCE_HEADER,
} from '../../replies';

export async function performance(userRequesting: User) {
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
      `\t1. ${generateTeamEmoji(firstBloodPerformance?._player?._team?.emoji)} ` +
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
