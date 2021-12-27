import type { Transaction } from 'sequelize';
import type { ArenaPlayer, User } from '../../../models';
import { findActiveArenaGame } from '../../../models/ArenaGame';
import { addArenaPlayers, addArenaPlayersToZones } from '../../../models/ArenaPlayer';
import { findArenaZoneByName } from '../../../models/ArenaZone';
import { findUsersBySlackIds } from '../../../models/User';
import { parseCommandTextToSlackIds } from '../../utils';

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
  transaction: Transaction
): Promise<ArenaPlayer[]> {
  const { arenaPlayers } = await addPlayers(commandText, transaction);
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
