import { isEmpty } from 'lodash';
import { User } from '../../../../../../models';
import { findActiveArenaGame } from '../../../../../../models/ArenaGame';
import {
  addArenaPlayers,
  addArenaPlayersToZones,
  getOrCreateBossesOrGuests,
} from '../../../../../../models/ArenaPlayer';
import { parseEscapedSlackUserValues } from '../../../../../../utils/slack';
import {
  adminAction,
  getGameError,
  getGameResponse,
  parseCommandTextToSlackIds,
} from '../../../../../utils';
import { withArenaTransaction } from '../../../../utils';
import {
  addPlayers,
  addSpectator,
  parseBossAndGuestCommandText,
} from '../../../../utils/addPlayer';
import { arenaCommandReply } from '../../replies';

export async function addPlayerCommand(commandText: string, userRequesting: User) {
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

    const { uniqueSlackIds } = await addPlayers(commandText, transaction);

    return getGameResponse(arenaCommandReply.adminAddedPlayers(Array.from(uniqueSlackIds)));
  });
}

export async function addSpectatorCommand(commandText: string, userRequesting: User) {
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

    const spectatorsAdded = await addSpectator(commandText, transaction);
    return getGameResponse(arenaCommandReply.adminAddedSpectators(spectatorsAdded));
  });
}

export async function addBossOrGuestCommand(
  commandText: string,
  userRequesting: User,
  isBoss: boolean
) {
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
