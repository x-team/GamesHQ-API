import { sampleSize } from 'lodash';
import type { Transaction } from 'sequelize';

import { getConfig } from '../../../config';
import type {
  ArenaPlayerPerformance,
  ArenaRound,
  ArenaRoundAction,
  Item,
  User,
} from '../../../models';
import { ArenaPlayer, ArenaZone } from '../../../models';
import { findLivingPlayersByGame, findPlayerByUser } from '../../../models/ArenaPlayer';
import { findActiveRound } from '../../../models/ArenaRound';
import type { ARENA_ACTIONS_TYPE } from '../../../models/ArenaRoundAction';
import { parseEscapedSlackUserValues } from '../../../utils/slack';
import type { ITEM_RARITY } from '../../consts/global';
import { ONE, ZERO } from '../../consts/global';
import type { RoundActionMessageBuilderParams } from '../../helpers';
import { generateTeamEmoji, roundActionMessageBuilder } from '../../helpers';
import type { SlackBlockKitLayoutElement } from '../../model/SlackBlockKit';
import type { GameResponse } from '../../utils';
import {
  getGameError,
  notifyEphemeral,
  openView,
  slackRequest,
  withTransaction,
} from '../../utils';
import { GameError } from '../../utils/GameError';
import type { ARENA_PLAYER_PERFORMANCE, ChangeLocationParams } from '../consts';
import {
  ARENA_SECONDARY_ACTIONS,
  ENEMY_REPOSITORY_NAME,
  WEAPON_REPOSITORY_NAME,
  ZONE_REPOSITORY_NAME,
  ADRENALINE_THRESHOLD,
  ARENA_PERK,
  ARENA_REPOSITORY_NAME,
  MAX_PLAYERS_PER_ARENA_ZONE,
} from '../consts';
import { generateChangeZonePickerBlock } from '../generators/gameplay';
import { arenaCommandReply } from '../repositories/arena/replies';

export interface PlayerActionsDeadOrAlive {
  interfaceName: 'PlayerActionsDeadOrAlive' | 'PlayerActionsAlive';
  player: ArenaPlayer;
  round: ArenaRound;
  zone: ArenaZone | undefined;
}

export async function playerActionsParams(
  userRequesting: User,
  needsToBeAlive: boolean,
  transaction: Transaction
): Promise<GameResponse | PlayerActionsDeadOrAlive> {
  const round = await findActiveRound(true, transaction);
  if (!round) {
    return getGameError(arenaCommandReply.noActiveRound());
  }
  const player = await findPlayerByUser(
    round._arenaGame?._gameId!,
    userRequesting.id,
    true,
    transaction
  );

  if (!player) {
    return getGameError(arenaCommandReply.playerNotInTheGame());
  }

  if (needsToBeAlive && !player.isAlive()) {
    return getGameError(arenaCommandReply.playerCannotWhileDead(player));
  }

  const zone = player._zone;
  await zone?.reload({
    include: [
      {
        association: ArenaZone.associations._players,
        include: [
          {
            association: ArenaPlayer.associations._game,
            where: { isActive: true },
          },
        ],
      },
    ],
    transaction,
  });
  return {
    interfaceName: needsToBeAlive ? 'PlayerActionsDeadOrAlive' : 'PlayerActionsAlive',
    player,
    round,
    zone,
  };
}
export function topPlayerPerformance(
  maxPlayersInTop: number,
  performanceField: ARENA_PLAYER_PERFORMANCE,
  playersPerformance: ArenaPlayerPerformance[]
): string {
  let mutableTopPerformance = '';
  for (let mutableIndex = 1; mutableIndex <= maxPlayersInTop; mutableIndex++) {
    const playerPerformance = playersPerformance[mutableIndex - 1];
    mutableTopPerformance += playerPerformance
      ? `\t${mutableIndex}. ${generateTeamEmoji(playerPerformance._player?._team?.emoji)} | <@${
          playerPerformance._player?._user?.slackId
        }> ` + `*[${playerPerformance[performanceField]}]*\n`
      : '';
  }
  return mutableTopPerformance;
}

export async function processWinner(round: ArenaRound, transaction: Transaction) {
  const playersAlive = await findLivingPlayersByGame(
    round._arenaGame?._gameId!,
    false,
    transaction
  );

  if (playersAlive.length === ONE) {
    const [winner] = playersAlive;
    await publishArenaMessage(arenaCommandReply.playerWinsGame(winner._user?.slackId!));
  }
  if (playersAlive.length > ONE && round._arenaGame?.teamBased) {
    const teamReference = playersAlive[ZERO]._teamId;
    const sameTeamPlayers = playersAlive.filter((p) => teamReference === p._teamId);
    if (sameTeamPlayers.length === playersAlive.length) {
      // All the players are from the same team
      await publishArenaMessage(
        arenaCommandReply.teamWinGame(playersAlive[ZERO]._team?.name ?? 'No Team')
      );
    }
  }
}

export function generateTargetGroup(
  hunter: ArenaPlayer,
  playersToHunt: ArenaPlayer[],
  isTeambased: boolean
) {
  return isTeambased
    ? playersToHunt.filter(
        (huntablePlayer) =>
          huntablePlayer.id !== hunter.id &&
          huntablePlayer.isAlive() &&
          huntablePlayer._teamId !== hunter._teamId
      )
    : playersToHunt.filter(
        (huntablePlayer) => huntablePlayer.id !== hunter.id && huntablePlayer.isAlive()
      );
}

export function parseRevivePlayerCommandText(commandText?: string) {
  return commandText && commandText.trim()
    ? (parseEscapedSlackUserValues(commandText.trim()) as string)
    : null;
}

export function arenaZoneCapacity(activeZonezAmount = ONE, deactivatedZonesAmount = ZERO) {
  const extraCapacity = Math.ceil(
    (deactivatedZonesAmount * MAX_PLAYERS_PER_ARENA_ZONE) / activeZonezAmount
  );
  return MAX_PLAYERS_PER_ARENA_ZONE + extraCapacity;
}

export function filterActionsById(actions: ArenaRoundAction[], actionId: ARENA_ACTIONS_TYPE) {
  return actions.filter((a) => a._availableActionId === actionId);
}

export function filterActionsByZone(actions: ArenaRoundAction[], zoneId: number) {
  return actions.filter((a) => a._player?._arenaZoneId === zoneId);
}

export function filterItemsByRarity(items: Item[], expectedRarity: ITEM_RARITY) {
  return items.filter((item) => item._itemRarityId === expectedRarity);
}

export function arenaPerkStats(perk: ARENA_PERK) {
  switch (perk) {
    case ARENA_PERK.ATTACK_PERK:
      return `_(+10 Attack, +20% Find Weapon)_`;
    case ARENA_PERK.DEFENSE_PERK:
      return `_(+10 Defense, +30% Find Armor)_`;
    case ARENA_PERK.STUN_RESISTANCE_PERK:
      return `_(+20% Stun resistance, +20% Find Healthkits)_`;
    case ARENA_PERK.ACCURACY_PERK:
      return `_(+20% Accuracy)_`;
    case ARENA_PERK.ADRENALINE_PERK:
      return `_(+Attack when *HP < ${ADRENALINE_THRESHOLD}*)_`;
  }
}

export function isArenaCommand(command: string) {
  const [arenaSign] = command.split('-');
  return arenaSign === '/arena' || arenaSign === '/ta';
}

export const isArenaConfigAction = (action: string) => {
  const actionArr = action.split('-');
  actionArr.pop();
  const configAction = actionArr.join('-');
  return (
    ARENA_SECONDARY_ACTIONS.CREATE_OR_UPDATE_ZONE_DATA === configAction ||
    ARENA_SECONDARY_ACTIONS.UPDATE_ZONE === configAction ||
    ARENA_SECONDARY_ACTIONS.DELETE_ZONE === configAction
  );
};

export function arenaRoundActionMessageBuilder(
  { player, arenaZonesAvailable }: ChangeLocationParams,
  {
    actionText,
    emoji,
    isVisible,
    secondaryMessage,
    additionalMessages,
  }: RoundActionMessageBuilderParams
) {
  let hasChangeLocation = false;
  const SAMPLES = 2;
  if (player.isAlive()) {
    hasChangeLocation = true;
  }
  const locations = sampleSize(
    arenaZonesAvailable.filter((zone) => zone.id !== player._arenaZoneId),
    SAMPLES
  );
  locations.push(player._zone!);
  return generateChangeZonePickerBlock(
    hasChangeLocation,
    roundActionMessageBuilder(actionText, emoji, isVisible, secondaryMessage, additionalMessages),
    locations,
    player._zone!
  );
}

// DATABASE
export function withArenaTransaction<T>(fn: (transaction: Transaction) => Promise<T>) {
  return withTransaction((transaction) => {
    return fn(transaction).catch(async (error) => {
      if (error instanceof GameError) {
        error.addRepository(ARENA_REPOSITORY_NAME);
      }
      throw error;
    });
  });
}

export function withWeaponTransaction<T>(fn: (transaction: Transaction) => Promise<T>) {
  return withTransaction((transaction) => {
    return fn(transaction).catch(async (error) => {
      if (error instanceof GameError) {
        error.addRepository(WEAPON_REPOSITORY_NAME);
      }
      throw error;
    });
  });
}

export function withEnemyTransaction<T>(fn: (transaction: Transaction) => Promise<T>) {
  return withTransaction((transaction) => {
    return fn(transaction).catch(async (error) => {
      if (error instanceof GameError) {
        error.addRepository(ENEMY_REPOSITORY_NAME);
      }
      throw error;
    });
  });
}

export function withZoneTransaction<T>(fn: (transaction: Transaction) => Promise<T>) {
  return withTransaction((transaction) => {
    return fn(transaction).catch(async (error) => {
      if (error instanceof GameError) {
        error.addRepository(ZONE_REPOSITORY_NAME);
      }
      throw error;
    });
  });
}

// SLACK REQUESTS
const ARENA_XHQ_SLACK_CHANNEL = 'SLACK_ARENA_XHQ_CHANNEL';
const SECONDS_BETWEEN_ACTIONS = 1000;

export function arenaNotifyEphemeral(
  message: string,
  userTo: string,
  channel: string,
  blocks?: SlackBlockKitLayoutElement[]
) {
  return notifyEphemeral(message, userTo, channel, getConfig('SLACK_ARENA_TOKEN'), blocks);
}

export async function publishArenaMessage(message: string, sendImmediately = false) {
  const xhqChannel = getConfig(ARENA_XHQ_SLACK_CHANNEL);
  const requestBody = { response_type: 'in_channel', text: message };
  if (sendImmediately) {
    await slackRequest(xhqChannel, requestBody);
  } else {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        slackRequest(xhqChannel, requestBody).then(resolve).catch(reject);
      }, SECONDS_BETWEEN_ACTIONS);
    });
  }
  return { xhqChannel, requestBody };
}

export async function arenaOpenView(requestBody: object) {
  return openView(requestBody, getConfig('SLACK_ARENA_TOKEN'));
}
