import { sampleSize } from 'lodash';
import type { Transaction } from 'sequelize';

import { getConfig } from '../../../config';
import { ArenaPlayerPerformance } from '../../../models';
import { ONE, ZERO } from '../../consts/global';
import { generateTeamEmoji, roundActionMessageBuilder } from '../../helpers';
import type { SlackBlockKitLayoutElement } from '../../model/SlackBlockKit';
import { notifyEphemeral, slackRequest, withTransaction } from '../../utils';
import { GameError } from '../../utils/GameError';
import type { ARENA_PLAYER_PERFORMANCE, ChangeLocationParams } from '../consts';
import {
  ADRENALINE_THRESHOLD,
  ARENA_PERK,
  ARENA_REPOSITORY_NAME,
  MAX_PLAYERS_PER_ARENA_ZONE,
} from '../consts';
import { generateChangeZonePickerBlock } from '../generators';

export function topPlayerPerformance(
  maxPlayersInTop: number,
  performanceField: ARENA_PLAYER_PERFORMANCE,
  playersPerformance: ArenaPlayerPerformance[]
): string {
  let mutableTopPerformance = '';
  for (let mutableIndex = 1; mutableIndex <= maxPlayersInTop; mutableIndex++) {
    const playerPerformance = playersPerformance[mutableIndex - 1];
    mutableTopPerformance += playerPerformance
      ? `\t${mutableIndex}. ${generateTeamEmoji(
          playerPerformance._player?._user?._team?.emoji
        )} | <@${playerPerformance._player?._user?.slackId}> ` +
        `*[${playerPerformance[performanceField]}]*\n`
      : '';
  }
  return mutableTopPerformance;
}

export function arenaZoneCapacity(activeZonezAmount = ONE, deactivatedZonesAmount = ZERO) {
  const extraCapacity = Math.ceil(
    (deactivatedZonesAmount * MAX_PLAYERS_PER_ARENA_ZONE) / activeZonezAmount
  );
  return MAX_PLAYERS_PER_ARENA_ZONE + extraCapacity;
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

interface RoundActionMessageBuilderParams {
  actionText: string;
  emoji: string;
  isVisible: boolean;
  secondaryMessage?: string;
  additionalMessages?: string[];
}

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
