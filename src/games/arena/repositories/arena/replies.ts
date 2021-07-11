import Boom from '@hapi/boom';
import a from 'indefinite';
import { capitalize } from 'lodash';
import type { Transaction } from 'sequelize';
import { logger } from '../../../../config';

import type {
  Game,
  ArenaPlayer,
  ArenaPlayerPerformance,
  Item,
  ArenaZone,
  User,
} from '../../../../models';
import { findActionsByRound } from '../../../../models/ArenaRoundAction';
import {
  APPROVE_SIGN,
  BOSS_EMOJI,
  BOSS_WEAPON_EMOJI,
  FULL_HEALTH_HEART_EMOJI,
  HEALTH_KIT_EMOJI,
  INFINITY_GIF_EMOJI,
  NO_ENTRY_SIGN,
  PLAYER_HIDE_EMOJI,
  PLAYER_VISIBLE_EMOJI,
  PUBLIC_FAVOURITE_EMOJI,
  RING_SYSTEM_EMOJI,
  SPINNER_EMOJI,
} from '../../../consts/emojis';
import { ITEM_TYPE, SELECT_TEAM_URL, SLACK_SPACE, TRAIT } from '../../../consts/global';
import {
  basicHealthDisplay,
  generateRarityColorEmoji,
  // generateTeamEmoji,
  randomSkinColor,
  zoneStatus,
} from '../../../helpers';
import {
  ARENA_ACTIONS,
  ARENA_PLAYER_PERFORMANCE,
  ChangeLocationParams,
  MAX_PLAYER_HEALTH,
} from '../../consts';
import { arenaNotifyEphemeral, arenaRoundActionMessageBuilder } from '../../utils';
import { playerStatus } from '../../utils/HUD';

const FILL_WITH_EMOJIS_FIRE = 18;
const FILL_WITH_EMOJIS_RING_SYSTEM = 18;
const FILL_WITH_EMOJIS_AIRDROP = 8;

function displayPlayers(players: ArenaPlayer[]) {
  const parsedPlayersInfo = players
    .map((player, index) => {
      const visibilityMessage = player.isVisible
        ? `${PLAYER_VISIBLE_EMOJI} Visible`
        : `${PLAYER_HIDE_EMOJI} Not Visible`;
      const hunterMessage = `${/*generateTeamEmoji(player._user?._team?.emoji)*/ ''} | <@${
        player._user?.slackId
      }>`;
      const healthMessage = `${FULL_HEALTH_HEART_EMOJI} ${player.health}`;
      return `${index + 1}. ${hunterMessage} | ${healthMessage} | ${visibilityMessage}`;
    })
    .join('\n');
  return parsedPlayersInfo;
}

function displaySpectators(spectators: ArenaPlayer[]) {
  const parsedSpectatorsInfo = spectators
    .map((spectator, index) => {
      const hunterMessage = `${/*generateTeamEmoji(spectator._user?._team?.emoji)*/ ''} | <@${
        spectator._user?.slackId
      }>`;
      return `${index + 1}. ${hunterMessage}`;
    })
    .join('\n');
  return parsedSpectatorsInfo;
}

export enum PLAYER_PERFORMANCE_HEADER {
  DAMAGE_DEALT = '\n\n:boom: *Damage Dealer* :boom:',
  HEALED = '\n\n:health-full: *Medic* :health-full:',
  KILLS = '\n\n:skull: *Grim Reaper* :skull:',
  WEAPONS_FOUND = '\n\n:arena-battlerifle: *Arms Dealer* :arena-battlerifle:',
  CHEERS_GIVEN = '\n\n:blobcheer: *Cheerleader* :blobcheer:',
  CHEERS_RECEIVED = `\n\n:star2: *Public Favourite* :star2:`,
  FIRST_BLOOD = `\n\n:feelsgood: *First Blood* :feelsgood:`,
}

export function generatePlayerPerformanceActionHeader(action: ARENA_PLAYER_PERFORMANCE): string {
  switch (action) {
    case ARENA_PLAYER_PERFORMANCE.CHEERS_GIVEN:
      return PLAYER_PERFORMANCE_HEADER.CHEERS_GIVEN;
    case ARENA_PLAYER_PERFORMANCE.CHEERS_RECEIVED:
      return PLAYER_PERFORMANCE_HEADER.CHEERS_RECEIVED;
    case ARENA_PLAYER_PERFORMANCE.DAMAGE_DEALT:
      return PLAYER_PERFORMANCE_HEADER.DAMAGE_DEALT;
    case ARENA_PLAYER_PERFORMANCE.HEALED:
      return PLAYER_PERFORMANCE_HEADER.HEALED;
    case ARENA_PLAYER_PERFORMANCE.KILLS:
      return PLAYER_PERFORMANCE_HEADER.KILLS;
    case ARENA_PLAYER_PERFORMANCE.WEAPONS_FOUND:
      return PLAYER_PERFORMANCE_HEADER.WEAPONS_FOUND;
    default:
      return '\n:shushing_face: *Performance* :shushing_face:';
  }
}

export const arenaCommandReply = {
  // GENERIC //////////////////////////////////////////////////////////////////////////
  couldNotFindBySlackId: (slackId: string) => `User with slack ID: <@${slackId}> not found`,
  noActiveRound: () => 'There is no The Arena round in progress.',
  noActiveGame: () => 'There is no active game. You can start a new The Arena game now.',
  playerWinsGame: (slackId: string) =>
    `\n:parrot-arena: We have a winner! :parrot-arena:\n` +
    `<@${slackId}> has claimed victory against the odds!\n`,
  teamWinGame: (name: string) =>
    `\n:parrot-arena: We have a winner! :parrot-arena:\n` +
    `*${capitalize(name)}* has claimed victory against the odds!\n`,
  noCommandTextProvided: () =>
    "This command needs parameters, please read command's description to find out",
  noSlackIdProvided: () =>
    `:eager: Hurry! You need to provide a valid user for this command to work`,
  somethingWentWrong: (functionName: string) =>
    `:scream: Something went wrong in The Arena ${functionName}`,
  zoneNeeded: () => `${NO_ENTRY_SIGN} You must be on a zone to perform this action`,
  zoneNotFound: () => `${NO_ENTRY_SIGN} The zone selected is not valid`,
  noBossProvided: () => `You didn't provide any boss(es) for this command to proceed`,
  noGuestProvided: () => `You didn't provide any guest(s) for this command to proceed`,
  playerNotABoss: () => `Only bosses can call this action directly`,

  // AREAS
  playersMoving: () =>
    `${SPINNER_EMOJI} Alive players are moving to a different area.\n ${PLAYER_VISIBLE_EMOJI} Check your \`Status\``,
  playerOneLineZone: (zone: ArenaZone) =>
    `> You are now in ${zone.emoji} *${zone.name}* ` +
    `[ _*${zone._players?.length}* players total_, _*${
      zone._players?.filter((p) => p.isVisible === false)?.length
    }* are hidden_ ]\n\n`,
  playerLocation: (willMove: boolean, arenaZone: ArenaZone) =>
    `${APPROVE_SIGN} When the round begins...\n` +
    `\t- You ${willMove ? `will move to` : `will stay in`} ${arenaZone.emoji} ${arenaZone.name}\n`,

  // ADMIN //////////////////////////////////////////////////////////////////////////////
  adminsOnly: () => 'Only admins or community team can perform this action',
  adminAddedPlayers: (slackId: string[]) =>
    `Added player(s) to The Arena game: ${slackId.map((x) => `"<@${x}>"`).join(', ')}.`,
  adminAddedBossesOrGuests: (slackId: string[], isBoss: boolean) =>
    `Added ${isBoss ? 'boss(es)' : 'guest(s)'} to The Arena game: ${slackId
      .map((x) => `"<@${x}>"`)
      .join(', ')}.`,
  adminMadeAllVisible: () => 'All players are now visible.',
  adminToggleZoneDeactivation: (isEnable: boolean) =>
    `Zone Deactivation: ${isEnable ? 'Enabled' : 'Disabled'}`,
  adminFinishedRound: () => 'Resolved last round and started a new one.',
  adminStartedNewRound: () => 'Resolving last round to start a new one.',
  adminEndedGame: (game: Game) => `The Arena game "${game.name}" ended.`,
  adminCreatedGame: (game: Game) => `*The Arena*\n Game "${game.name}" has been created.`,
  adminWeaponsForEveryone: (weapon: Item) => `Everyone gets a ${weapon.name}`,
  adminPlayersInfoPosted: () => 'Players Info Displayed',
  adminIdlePlayers: (players: ArenaPlayer[]) =>
    `*PLAYERS PENDING TO SEND ACTIONS*\n${displayPlayers(players)}`,
  adminRevivedBoss: (bossSlackId: string) => `<@${bossSlackId}> will be revived now!`,
  teamNameNeeded: () => 'You must provide a Team Name for this command',
  playersWithoutTeam: (users: User[]) =>
    `Some users don't have a team set.\n` +
    'A notification will be sent to them.\n' +
    'Please review this issue. *Once all of them have a team set* run `/arena-addplayer` command, again.\n' +
    `*USERS*\n${users.map((user, index) => `*${index + 1}.* <@${user.slackId}>`).join('\n')}`,
  cancelEndGame: () =>
    'Ok, the arena is still running, nothing happened here, you can keep walking :cop::skin-tone-2:',
  confirmNarrowWeapons: (enableWeapons: Item[], disableWeapons: Item[]) =>
    `Weapon narrowing complete (it will only be valid for this game).\n\n*Enabled*: ${enableWeapons.map(
      (weapon) => ` ${generateRarityColorEmoji(weapon._itemRarityId)}${weapon.emoji} `
    )}\n*Disabled*: ${disableWeapons.map(
      (weapon) => ` ${generateRarityColorEmoji(weapon._itemRarityId)}${weapon.emoji}`
    )}`,
  confirmNarrowZones: (enabledZones: ArenaZone[], disabledZones: ArenaZone[]) =>
    `Zone narrowing complete (it will only be valid for this game).\n\n*Enabled*: ${enabledZones.map(
      (zone) => ` (${zone.ring}) ${zone.emoji} `
    )}\n*Disabled*: ${disabledZones.map((zone) => ` (${zone.ring}) ${zone.emoji}`)}`,

  // CHANNEL ////////////////////////////////////////////////////////////////////////////
  channelTotalPlayersAlive: (total: number) => `_*Total players still alive:* ${total}_`,

  channelActiveZones: (zones: ArenaZone[]) =>
    `_*Areas still active:*_ ${zones.map((z) => z.emoji).join(`${SLACK_SPACE}`)}`,

  channelZonesToDeactivate: (zones: ArenaZone[]) =>
    `${Array(FILL_WITH_EMOJIS_RING_SYSTEM).fill(`${RING_SYSTEM_EMOJI}`).join(SLACK_SPACE)}\n\n` +
    `\t\t:xyou: Memory Sweeper will activate on next round!\n` +
    `\t\tRAM is being reallocated.\n` +
    `${
      zones.length > 0
        ? `\t\tStay away from these zones:\t${zones.map((z) => z.emoji).join(`${SLACK_SPACE}`)}\n\n`
        : ''
    }` +
    `${Array(FILL_WITH_EMOJIS_RING_SYSTEM).fill(`${RING_SYSTEM_EMOJI}`).join(SLACK_SPACE)}\n\n`,

  channelRunningRingSystem: () => `:xyou: Running Memory Sweeper ${RING_SYSTEM_EMOJI}`,

  channelEndGame: (game: Game) => `The Arena game "${game.name}" ended. Thanks for playing!`,

  channelWeaponsForEveryone: (weapon: Item) =>
    `${Array(FILL_WITH_EMOJIS_AIRDROP).fill(':booom: :airplane:').join('\u0020')}\n\n` +
    'The table is ready for the feast. ' +
    `*Everyone* gets ${a(weapon.name, { articleOnly: true })} *${
      weapon.name
    }*${generateRarityColorEmoji(weapon._itemRarityId)}${weapon.emoji} \n\n` +
    `${Array(FILL_WITH_EMOJIS_AIRDROP).fill(':booom: :airplane:').join('\u0020')}\n`,

  channelEndingTheRound: () => 'Ending the round...',

  channelAllVisible: () =>
    `${Array(FILL_WITH_EMOJIS_FIRE).fill(':fireball:').join(`${SLACK_SPACE}`)}\n` +
    ':fireball:\tThe Ring of Fire is closing in, burning everything in its wake!\t:fireball:\n' +
    ':fireball:\t\t\t\t\t\tPlayers are all running to the centre!\t\t\t\t\t\t:fireball:\n' +
    ':fireball:\t\t\t\t\t\t\t   *Everyone is out in the open*  \t\t\t\t\t\t\t:fireball:\n' +
    `${Array(FILL_WITH_EMOJIS_FIRE).fill(':fireball:').join(`${SLACK_SPACE}`)}`,

  channelDisplayPlayersInfo: (players: ArenaPlayer[]) =>
    `*HUNTERS ALIVE*\n${displayPlayers(players)}\n`,

  channelDisplaySpectators: (spectators: ArenaPlayer[]) =>
    `*SPECTATORS*\n${displaySpectators(spectators)}\n`,

  channelBossRevived: (bossSlackId: string, health: number) =>
    `${SPINNER_EMOJI} <@${bossSlackId}> _regenerating HP_ ${SPINNER_EMOJI}\n` +
    `<@${bossSlackId}> now has ( ${FULL_HEALTH_HEART_EMOJI} ${health} )`,

  channelListOutstandingPerformance: (ranking: string) =>
    `:trophy: *OUTSTANDING PERFORMANCE* :trophy:\n` + `${ranking}`,

  // BOSS ///////////////////////////////////////////////////////////////////////////
  bossHuntsPlayers: ({ player, arenaZonesAvailable }: ChangeLocationParams, isVisible: boolean) => {
    return arenaRoundActionMessageBuilder(
      {
        player,
        arenaZonesAvailable,
      },
      {
        actionText: `start *hunting players* with`,
        emoji: BOSS_WEAPON_EMOJI,
        isVisible,
        secondaryMessage: 'If you hit, you will deal damage to *1 player*',
      }
    );
  },
  bossChangesLocation: ({ player, arenaZonesAvailable }: ChangeLocationParams) =>
    arenaRoundActionMessageBuilder(
      {
        player,
        arenaZonesAvailable,
      },
      {
        actionText: `*Change Location* (choose it below)`,
        emoji: BOSS_EMOJI,
        isVisible: player.isVisible,
      }
    ),
  // PLAYER ///////////////////////////////////////////////////////////////////////////
  playerStatus,

  playerOneLineStatus: (player: ArenaPlayer, playerPerformance?: ArenaPlayerPerformance | null) => {
    const weapons = player._weapons?.length ? player._weapons : undefined;
    const armor = player._armors?.length ? player._armors[0] : undefined;
    const healthkit = player._healthkits?.length
      ? player._healthkits.find((healthkit) => healthkit.name === ITEM_TYPE.HEALTH_KIT)
      : undefined;
    const cheersAmount = playerPerformance?.cheersReceived ?? 0;
    return (
      `${basicHealthDisplay(player.health, MAX_PLAYER_HEALTH)}` +
      `${
        weapons
          ? `*|*${weapons
              .map(
                (w) =>
                  `${generateRarityColorEmoji(w._itemRarityId)}${w.emoji}x${
                    w.ArenaItemInventory.remainingUses ?? ` ${INFINITY_GIF_EMOJI}`
                  }`
              )
              .join(`${SLACK_SPACE}`)} `
          : ''
      }` +
      `${armor ? `*|* ${armor.emoji} ` : ''}` +
      `*|* ${HEALTH_KIT_EMOJI}x${healthkit ? healthkit.ArenaItemInventory.remainingUses : 0} ` +
      `*|* ${player.isVisible ? PLAYER_VISIBLE_EMOJI : PLAYER_HIDE_EMOJI} ` +
      `*|* ${PUBLIC_FAVOURITE_EMOJI} ${cheersAmount}`
    );
  },

  playerDoesntHaveAction: () => ":eager: Hurry! You haven't provided a valid action",

  playerDoesntHaveLastCheerAction: () =>
    `${NO_ENTRY_SIGN} You don't have a "last cheer" to grab a user from`,

  playerNotInTheGame: () =>
    `${NO_ENTRY_SIGN}  You need to be added, by an admin, to a The Arena game.`,

  playerCannotCheerDeads: (targetSlackId: string) =>
    `${NO_ENTRY_SIGN}  You can't cheer <@${targetSlackId}>, because is dead.\n` +
    `:eager: Hurry! Take another action!`,

  playerCannotWhileDead: (player: ArenaPlayer) =>
    `${NO_ENTRY_SIGN}  You cannot do this action because you're dead :rip:.` +
    `\n\n${playerStatus(player)}`,

  playerHealsSomebodyMaxed: (targetSlackId: string) =>
    `${NO_ENTRY_SIGN} <@${targetSlackId}> is at full health.\n:eager: Hurry! Take another action!`,

  playerHealsSelfMaxed: () =>
    `${NO_ENTRY_SIGN} Your health is alright.\n:eager: Hurry! Take another action!`,

  playerNeedsHealthKit: () =>
    `${NO_ENTRY_SIGN} You need to find a health kit to revive.\n` +
    'Use `Search for a healthkit` first.',

  playerHealsSelf: (
    { player, arenaZonesAvailable }: ChangeLocationParams,
    isVisible: boolean,
    healthkitHealingPower: number
  ) =>
    arenaRoundActionMessageBuilder(
      {
        player,
        arenaZonesAvailable,
      },
      {
        actionText: `*heal* +${healthkitHealingPower} HP`,
        emoji: FULL_HEALTH_HEART_EMOJI,
        isVisible,
      }
    ),

  playerHealsSomebody: (
    { player, arenaZonesAvailable }: ChangeLocationParams,
    targetSlackId: string,
    isSourceVisible: boolean,
    healthkitHealingPower: number
  ) =>
    arenaRoundActionMessageBuilder(
      {
        player,
        arenaZonesAvailable,
      },
      {
        actionText: `*heal* <@${targetSlackId}> for +${healthkitHealingPower} HP`,
        emoji: FULL_HEALTH_HEART_EMOJI,
        isVisible: isSourceVisible,
      }
    ),

  playerSearchesForItem: (
    action: string,
    { player, arenaZonesAvailable }: ChangeLocationParams
  ) => {
    let mutableActionText = 'something';
    let mutableEmoji = ':mag:';
    let mutableComplementaryMessage = 'will help you';
    switch (action) {
      case ARENA_ACTIONS.SEARCH_HEALTH:
        mutableActionText = 'health kits';
        mutableEmoji = ':medkit:';
        mutableComplementaryMessage = 'can help revive your (or others) health';
        break;
      case ARENA_ACTIONS.SEARCH_WEAPONS:
        mutableActionText = 'weapons';
        mutableComplementaryMessage = 'will allow you to hunt others.';
        break;
      case ARENA_ACTIONS.SEARCH_ARMOR:
        mutableActionText = 'armors';
        mutableComplementaryMessage = 'will allow you to reduce damage from an attack.';
        break;
    }
    return arenaRoundActionMessageBuilder(
      {
        player,
        arenaZonesAvailable,
      },
      {
        actionText: `start *looking for ${mutableActionText}*`,
        emoji: mutableEmoji,
        isVisible: true,
        secondaryMessage: `If you find one, it ${mutableComplementaryMessage}`,
      }
    );
  },

  playerHides: ({ player, arenaZonesAvailable }: ChangeLocationParams) =>
    arenaRoundActionMessageBuilder(
      {
        player,
        arenaZonesAvailable,
      },
      {
        actionText: `*find somewhere to hide*`,
        emoji: PLAYER_HIDE_EMOJI,
        isVisible: false,
        secondaryMessage:
          'You will then be safe from being hunted by enemies (unless they have the _Detect_ trait)',
      }
    ),

  playerCheers: (
    { player, arenaZonesAvailable }: ChangeLocationParams,
    targetPlayerSlackId: string
  ) =>
    arenaRoundActionMessageBuilder(
      {
        player,
        arenaZonesAvailable,
      },
      {
        actionText: `*Cheer* <@${targetPlayerSlackId}>`,
        emoji: ':parrot-arena:',
        isVisible: player.isVisible,
      }
    ),

  playerCannotHide: () =>
    `${NO_ENTRY_SIGN} There is nowhere to hide due to the flames :fireball:\n:eager: Hurry! Take another action!`,

  playerHuntsPlayers: (
    { player, arenaZonesAvailable }: ChangeLocationParams,
    weapon: Item,
    isVisible: boolean
  ) => {
    let mutableSecondaryMessage = 'If you hit, you will deal damage to *1 player*';
    if (weapon.hasTrait(TRAIT.BLAST_2)) {
      mutableSecondaryMessage = '_[Area Damage]_ If you hit, you will deal damage to *2 players*';
    }
    if (weapon.hasTrait(TRAIT.BLAST_3)) {
      mutableSecondaryMessage = '_[Area Damage]_ If you hit, you will deal damage to *3 players*';
    }
    if (weapon.hasTrait(TRAIT.BLAST_ALL)) {
      mutableSecondaryMessage =
        '_[Area Damage]_ If you hit, you will deal damage to *all* players around you';
    }
    return arenaRoundActionMessageBuilder(
      {
        player,
        arenaZonesAvailable,
      },
      {
        actionText: `start *hunting players* with`,
        emoji: weapon.emoji,
        isVisible,
        secondaryMessage: mutableSecondaryMessage,
      }
    );
  },

  playerNeedsWeapon: (player: ArenaPlayer) =>
    `${NO_ENTRY_SIGN} You need to find a weapon before you can hunt other players!\n` +
    `:point_right:${randomSkinColor()} Try searching for weapons first, but remember that you’ll be visible to other players.` +
    `\n\n${playerStatus(player)}`,

  playerChooseWeapon: () => 'Which of your weapons would you like to hunt with?',
  adminGiveWeaponForEveryone: () => 'Which weapon do you want to give to every player?',

  playerChooseTarget: (zone: ArenaZone, hiddenPlayers: number) =>
    `${zoneStatus(zone)}\n\n` +
    `${
      hiddenPlayers
        ? `${PLAYER_HIDE_EMOJI} There ${
            hiddenPlayers === 1 ? 'is 1 player' : `are ${hiddenPlayers} players`
          } watching you ${PLAYER_VISIBLE_EMOJI}\n\n`
        : ''
    }` +
    `:dart: Pick your target wisely`,

  playerCannotCarryMoreHealthkits: () =>
    `${NO_ENTRY_SIGN} You can't carry more healthkits in your bag.\n` +
    `:eager: Hurry! choose another action`,

  playerDontHaveTeam: () =>
    `You don't have a team set. Please visit ${SELECT_TEAM_URL} or ask an admin to add you to one.`,

  noTargetsAvailable: () =>
    `${NO_ENTRY_SIGN} There are no targets available, you are alone! :smile:`,

  playerIsNotBoss: (playerSlackId: string) =>
    `<@${playerSlackId}> was not added as boss for this game`,

  noTargetsVisibleButPresent: (hiddenPlayers: number, zone: ArenaZone) =>
    `${zoneStatus(zone)}\n` +
    `:warning: There's no one visible to hunt around you\n` +
    `${PLAYER_HIDE_EMOJI} There ${
      hiddenPlayers === 1 ? 'is 1 player' : `are ${hiddenPlayers} players`
    } watching you ${PLAYER_VISIBLE_EMOJI}\n` +
    `${hiddenPlayers > 0 ? `Please select a weapon with detect` : ''}`,
};

export async function notifyPlayersWhoWantedToHide(
  roundId: number,
  channelId: string,
  transaction?: Transaction
) {
  const hideActionsByRound = await findActionsByRound(roundId, ARENA_ACTIONS.HIDE, transaction);
  const reply = arenaCommandReply.playerCannotHide();
  hideActionsByRound.map((hideAction) => {
    const player = hideAction._player!;
    arenaNotifyEphemeral(reply, player._user?.slackId!, channelId).catch((error) => {
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
}
