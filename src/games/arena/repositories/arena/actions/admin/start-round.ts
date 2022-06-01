import type { User } from '../../../../../../models';
import { findLivingPlayersByGame } from '../../../../../../models/ArenaPlayer';
import {
  countRoundsCompleted,
  findActiveRound,
  startRound,
} from '../../../../../../models/ArenaRound';
import {
  findActiveArenaZones,
  findArenaZonesWithPlayers,
  findRingSystemZonesToDeactivate,
  ringDeactivationSystem,
} from '../../../../../../models/ArenaZone';
import { ONE, THREE, ZERO } from '../../../../../consts/global';
import { adminAction, getGameError, getGameResponse } from '../../../../../utils';
import { processWinner, publishArenaMessage, withArenaTransaction } from '../../../../utils';
import { ArenaEngine } from '../../engine';
import { arenaCommandReply } from '../../replies';

const arenaGameEngine = ArenaEngine.getInstance();

export async function startRoundCommand(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const round = await findActiveRound(true, transaction);
    if (!round) {
      return getGameError(arenaCommandReply.noActiveRound());
    }
    const isEveryoneVisible = round.isEveryoneVisible;
    // Lock the round so no one can send more commands
    arenaGameEngine.setRoundState(true);
    await publishArenaMessage(arenaCommandReply.channelEndingTheRound(), true);

    // 0. Set IDLE players to "Stay on location" action
    await arenaGameEngine.assignZoneActionToIdlePlayers(round, transaction);
    await round.customReload(true, transaction);
    // 1. Actions (Per Zone)
    const zonesWithPlayers = await findArenaZonesWithPlayers(transaction);
    for (const zone of zonesWithPlayers) {
      await arenaGameEngine.runRound(zone, round, transaction);
    }
    // 2. Movement: Players Location
    await arenaGameEngine.processChangeLocation(round._actions ?? [], transaction);

    const playersAlive = await findLivingPlayersByGame(round._gameId, false, transaction);
    const amountOfPlayersAlive = playersAlive.length;

    await publishArenaMessage(arenaCommandReply.channelTotalPlayersAlive(amountOfPlayersAlive));

    // Search for a winner
    await processWinner(round, transaction);
    await startRound(round._gameId, userRequesting.id, isEveryoneVisible, transaction);
    const roundsCompleted = await countRoundsCompleted(transaction);

    const activeZonesForCurrentRound = await findActiveArenaZones(transaction);

    if (round._game?._arena?.hasZoneDeactivation && activeZonesForCurrentRound.length > ONE) {
      if ((roundsCompleted + ONE) % THREE === ZERO) {
        const zonesToDeactivate = await findRingSystemZonesToDeactivate(
          {
            ringSystemAlgorithm: round._game?._arena?.ringSystemAlgorithm,
            currentRingDeactivation: round._game?._arena?.currentRingDeactivation,
          },
          transaction
        );
        await publishArenaMessage(arenaCommandReply.channelZonesToDeactivate(zonesToDeactivate));
      }

      if (roundsCompleted % THREE === ZERO) {
        await publishArenaMessage(arenaCommandReply.channelRunningRingSystem());
        await ringDeactivationSystem(round._game._arena, transaction);
      }
    }

    const activeZonesForNextRound = await findActiveArenaZones(transaction);
    await publishArenaMessage(arenaCommandReply.channelActiveZones(activeZonesForNextRound));
    if (activeZonesForNextRound.length > ONE) {
      await publishArenaMessage(arenaCommandReply.playersMoving());
    }
    // unlock the round so everyone can send more commands
    arenaGameEngine.setRoundState(false);
    return getGameResponse(arenaCommandReply.adminFinishedRound());
  });
}
