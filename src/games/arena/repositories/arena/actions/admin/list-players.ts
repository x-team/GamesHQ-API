import type { User } from '../../../../../../models';
import { findActiveArenaGame } from '../../../../../../models/ArenaGame';
import {
  findLivingPlayersByGame,
  findSpectatorsByGame,
  getIdlePlayers,
} from '../../../../../../models/ArenaPlayer';
import { findActiveRound } from '../../../../../../models/ArenaRound';
import { adminAction, getGameError, getGameResponse } from '../../../../../utils';
import { publishArenaMessage, withArenaTransaction } from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function listPlayers(userRequesting: User) {
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

export async function listSpectators(userRequesting: User) {
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

export async function listIdlePlayers(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const round = await findActiveRound(true, transaction);
    if (!round) {
      return getGameError(arenaCommandReply.noActiveRound());
    }
    const actions = round._actions || [];
    const idlePlayers = await getIdlePlayers(round._gameId, actions, transaction);
    return getGameResponse(arenaCommandReply.adminIdlePlayers(idlePlayers));
  });
}
