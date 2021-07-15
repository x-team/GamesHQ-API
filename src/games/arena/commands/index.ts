import type { User } from '../../../models';
import { getGameResponse } from '../../utils';
import { ARENA_SLACK_COMMANDS } from '../consts';
import { ArenaRepository } from '../repositories/arena/arena';
import { ArenaEngine } from '../repositories/arena/engine';

const arena = new ArenaRepository(ArenaEngine.getInstance());

interface ArenaSwitchCommandOptions {
  command: string;
  commandText: string;
  userRequesting: User;
  channelId: string;
  triggerId: string;
}

export function arenaSwitchCommand({
  command,
  commandText,
  userRequesting,
  channelId,
}: // triggerId,
ArenaSwitchCommandOptions) {
  const isRoundRunning = arena.arenaGameEngine.getRoundState();
  if (isRoundRunning) {
    return getGameResponse('Please wait until the Round log finishes');
  }
  switch (command) {
    // ADMIN
    case ARENA_SLACK_COMMANDS.NEW_GAME:
      if (!commandText) {
        commandText = '';
      }
      return arena.newGame(commandText, userRequesting);
    case ARENA_SLACK_COMMANDS.END_GAME:
      return arena.askEndGame(userRequesting);
    case ARENA_SLACK_COMMANDS.ENABLE_ZONE_DEACTIVATION:
      return arena.toggleZoneDeactivationSystem(userRequesting, true);
    case ARENA_SLACK_COMMANDS.DISABLE_ZONE_DEACTIVATION:
      return arena.toggleZoneDeactivationSystem(userRequesting, false);
    case ARENA_SLACK_COMMANDS.ADD_PLAYER:
      return arena.addPlayer(commandText, userRequesting, channelId);
    case ARENA_SLACK_COMMANDS.ADD_BOSS:
      return arena.addBossOrGuest(commandText, userRequesting, true);
    case ARENA_SLACK_COMMANDS.ADD_GUEST:
      return arena.addBossOrGuest(commandText, userRequesting, false);
    case ARENA_SLACK_COMMANDS.ADD_SPECTATOR:
      return arena.addSpectator(commandText, userRequesting, channelId);
    case ARENA_SLACK_COMMANDS.LIST_PLAYERS:
      return arena.listPlayers(userRequesting);
    case ARENA_SLACK_COMMANDS.LIST_SPECTATORS:
      return arena.listSpectators(userRequesting);
    case ARENA_SLACK_COMMANDS.LIST_IDLE:
      return arena.listIdlePlayers(userRequesting);
    case ARENA_SLACK_COMMANDS.PERFORMANCE:
      return arena.performance(userRequesting);
    case ARENA_SLACK_COMMANDS.REVIVE_BOSS:
      return arena.reviveBoss(commandText, userRequesting);
    case ARENA_SLACK_COMMANDS.MAKE_ALL_VISIBLE:
      return arena.makeAllVisible(channelId, userRequesting);
    case ARENA_SLACK_COMMANDS.GIVE_EVERYONE_WEAPON:
      return arena.selectWeaponForEveryone(userRequesting);
    // case ARENA_SLACK_COMMANDS.START_ROUND:
    //   arena.startRound(userRequesting).catch((e) => {
    //     return handleBoomErrorsToSlack(e);
    //   });
    //   return adminsAndCommunityTeam(userRequesting, async () => {
    //     return getEphemeralText(CommandReply.adminFinishedRound());
    //   });
    // case ARENA_SLACK_COMMANDS.NARROW_WEAPONS:
    //   return arena.startNarrowWeaponsQuestion(userRequesting);
    // case ARENA_SLACK_COMMANDS.CREATE_ZONE:
    //   return arena.openCreateZoneModal(userRequesting, triggerId);
    // case ARENA_SLACK_COMMANDS.UPDATE_ZONE:
    //   return arena.listZones(userRequesting);
    // case ARENA_SLACK_COMMANDS.NARROW_ZONES:
    //   return arena.narrowZones(userRequesting);

    // // PLAYERS
    // case ARENA_SLACK_COMMANDS.ACTIONS:
    //   return arena.actionsMenu(userRequesting);
    // case `/${ARENA_SLACK_COMMANDS.STATUS}`:
    //   return arena.status(userRequesting);
    default:
      return getGameResponse('Please provide a valid The Arena command');
  }
}
