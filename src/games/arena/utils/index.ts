import { sampleSize } from 'lodash';
import type { Transaction } from 'sequelize';
import { getConfig } from '../../../config';
import { ONE, ZERO } from '../../consts/global';
import { roundActionMessageBuilder } from '../../helpers';
import { SlackBlockKitLayoutElement } from '../../model/SlackBlockKit';
import { notifyEphemeral, withTransaction } from '../../utils';
import {
  ADRENALINE_THRESHOLD,
  ARENA_PERK,
  ChangeLocationParams,
  MAX_PLAYERS_PER_ARENA_ZONE,
} from '../consts';
import { generateChangeZonePickerBlock } from '../generators';

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
  let hasChangeLocation: boolean = false;
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
  return withTransaction(fn).catch(async (error) => {
    if (error.data?.userToNotify) {
      await arenaNotifyEphemeral(error.message, error.data.userToNotify, error.data.userToNotify);
    }
  });
}

// SLACK REQUESTS
export function arenaNotifyEphemeral(
  message: string,
  userTo: string,
  channel: string,
  blocks?: SlackBlockKitLayoutElement[]
) {
  return notifyEphemeral(message, userTo, channel, getConfig('SLACK_ARENA_TOKEN'), blocks);
}
