import type { Transaction } from 'sequelize';
import Boom from '@hapi/boom';
import { ArenaPlayer, User } from '../../../models';
import { findArenaZoneByName } from '../../../models/ArenaZone';
import { addArenaPlayers, addArenaPlayersToZones } from '../../../models/ArenaPlayer';
import { findActiveArenaGame } from '../../../models/ArenaGame';
import { findUsersBySlackIds } from '../../../models/User';
import { arenaNotifyEphemeral } from '.';
import { arenaCommandReply } from '../repositories/arena/replies';
import { parseCommandTextToSlackIds } from '../../utils';
import { logger } from '../../../config';

export function parseBossAndGuestCommandText(commandtext: string) {
  const bracesRegExp = new RegExp(/\{(.*?)\}/, 'g');
  const NO_BRACES_AT_START = 1;
  const NO_BRACES_AT_END = 2;
  const [teamInBraces] = commandtext.match(bracesRegExp) || [null];
  const teamName = teamInBraces?.substr(NO_BRACES_AT_START, teamInBraces.length - NO_BRACES_AT_END);
  const usersList = commandtext.replace(bracesRegExp, '').trim();
  return [teamName, usersList];
}

export async function addSpectator(
  commandText: string,
  userRequesting: User,
  channelId: string,
  transaction: Transaction
): Promise<ArenaPlayer[]> {
  const { arenaPlayers } = await addPlayers(commandText, userRequesting, channelId, transaction);
  for (let i = 0; i < arenaPlayers.length; i++) {
    await arenaPlayers[i].update(
      {
        health: 0,
        isVisible: false,
        isSpectator: true,
      },
      { transaction }
    );
  }

  const streamingZone = await findArenaZoneByName('Streaming Zone');
  await addArenaPlayersToZones(
    {
      arenaPlayers,
      zones: [streamingZone!],
    },
    transaction
  );

  return arenaPlayers;
}

export async function addPlayers(
  commandText: string,
  userRequesting: User,
  channelId: string,
  transaction: Transaction
): Promise<{
  arenaPlayers: ArenaPlayer[];
  uniqueSlackIds: Set<string>;
}> {
  const game = await findActiveArenaGame(transaction);
  if (!game) {
    return {
      arenaPlayers: [],
      uniqueSlackIds: new Set(),
    };
  }
  const slackIds = parseCommandTextToSlackIds(commandText);
  const users: User[] = [];

  if (slackIds.length) {
    const userSlackIds = await findUsersBySlackIds(slackIds);
    users.push(...userSlackIds);
  }
  const uniqueSlackIds = new Set<string>();
  slackIds.forEach((id) => uniqueSlackIds.add(id));
  const usersWithNoTeamSet = users.filter((user) => !user._teamId);
  if (usersWithNoTeamSet.length && game._arena?.teamBased) {
    const reply = arenaCommandReply.playerDontHaveTeam();
    usersWithNoTeamSet.map((userToNotify) => {
      arenaNotifyEphemeral(reply, userToNotify.slackId!, channelId).catch((error) => {
        if (Boom.isBoom(error)) {
          const {
            output: {
              payload: { message },
            },
          } = error;
          logger.error(message);
        } else {
          logger.error(arenaCommandReply.somethingWentWrong('Notify Ephemeral'));
        }
      });
    });
    await arenaNotifyEphemeral(
      arenaCommandReply.playersWithoutTeam(usersWithNoTeamSet),
      userRequesting.slackId!,
      channelId
    );
  }
  const arenaPlayers = await addArenaPlayers(
    {
      gameId: game.id,
      users,
      areBosses: false,
    },
    transaction
  );
  await addArenaPlayersToZones({ arenaPlayers }, transaction);
  return {
    arenaPlayers,
    uniqueSlackIds,
  };
}
