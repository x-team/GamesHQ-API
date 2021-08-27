import { random } from 'lodash';
import type { Transaction } from 'sequelize';
import { getConfig } from '../../../config';
import { Game, TowerRaider, TowerRound, TowerRoundAction, User } from '../../../models';
import { findActiveTowerGame } from '../../../models/TowerGame';
import { findRaiderByUser } from '../../../models/TowerRaider';
import { findActiveRound } from '../../../models/TowerRound';
import { TOWER_ACTIONS_TYPE } from '../../../models/TowerRoundAction';
import { TOWER_HEALTHKITS, TOWER_REPOSITORY_NAME } from '../../tower/consts';

import { ONE, HUNDRED, ITEM_RARITY } from '../../consts/global';
import { roundActionMessageBuilder, RoundActionMessageBuilderParams } from '../../helpers';
import type { SlackBlockKitLayoutElement } from '../../model/SlackBlockKit';
import {
  chatUnfurl,
  GameResponse,
  getGameError,
  hasLuck,
  notifyEphemeral,
  notifyInPrivate,
  openView,
  slackRequest,
  withTransaction,
} from '../../utils';
import { GameError } from '../../utils/GameError';
import { RollSearchRarityParams, weightedChance } from '../../utils/rollRarity';

import {
  LUCK_ELIXIR_BOOST,
  TOWER_ACTIONS,
  LOOT_PRIZE_ITEM_CHANCE,
  LOOT_PRIZE_ARMOR_CHANCE,
  LOOT_PRIZE_WEAPON_CHANCE,
  HEALTHKIT_ITEM_CHANCE,
  DEFAULT_SORT_INITIATIVE_SUCCESS_RATE,
  TOWER_SECONDARY_SLACK_ACTIONS,
  ENEMY_DEFAULT_SORT_INITIATIVE_SUCCESS_RATE,
  ENEMY_HIDE_CHANCE,
  ENEMY_HUNT_CHANCE,
  TOWER_LOOT_PRIZES,
} from '../consts';
import { towerCommandReply } from '../repositories/tower/replies';

const TOWER_SLACK_CHANNEL = 'SLACK_THE_TOWER_CHANNEL';

export interface TowerRaiderInteraction {
  interfaceName: 'TowerRaiderInteraction';
  raider: TowerRaider;
  round: TowerRound;
}

export async function activeTowerHandler(transaction: Transaction): Promise<GameResponse | Game> {
  const activeTower = await findActiveTowerGame(transaction);
  if (!activeTower) {
    return getGameError(towerCommandReply.noActiveTower());
  }
  return activeTower;
}

export async function towerGatesHandler(activeTower: Game) {
  if (!activeTower._tower?.isOpen) {
    return getGameError(towerCommandReply.noOpenedTower());
  }
  return true;
}

export async function raiderActionsAlive(
  userRequesting: User,
  transaction: Transaction
): Promise<GameResponse | TowerRaiderInteraction> {
  const activeTower = await activeTowerHandler(transaction);
  if (!(activeTower instanceof Game)) {
    return activeTower as GameResponse;
  }
  const towerGates = await towerGatesHandler(activeTower);
  if (towerGates !== true) {
    return towerGates as GameResponse;
  }
  const raider = await findRaiderByUser(userRequesting.id, true, transaction);
  if (!raider) {
    return getGameError(towerCommandReply.raiderNotInTheGame());
  }
  const raidersTowerFloor = activeTower._tower?.findRaiderInTower(raider);
  if (!raidersTowerFloor) {
    return getGameError(towerCommandReply.raiderNotInTheGame());
  }
  const activeRound = await findActiveRound(raider._towerFloorBattlefieldId!, false, transaction);

  if (!activeRound && raidersTowerFloor) {
    return getGameError(towerCommandReply.raiderMustRestart());
  }

  if (!activeRound) {
    return getGameError(towerCommandReply.noActiveRound());
  }

  return {
    interfaceName: 'TowerRaiderInteraction',
    raider,
    round: activeRound,
  };
}

export function towerRoundActionMessageBuilder({
  actionText,
  emoji,
  isVisible,
  secondaryMessage,
  additionalMessages,
}: RoundActionMessageBuilderParams) {
  return roundActionMessageBuilder(
    actionText,
    emoji,
    isVisible,
    secondaryMessage,
    additionalMessages
  );
}

// Utils
export function isTowerCommand(command: string) {
  return command.startsWith('/tower');
}

export const isTowerConfigAction = (action: string) => {
  const actionArr = action.split('-');
  actionArr.pop();
  const configAction = actionArr.join('-');
  return (
    TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_AMOUNT_TO_TOWER_FLOOR === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_YES === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_FLOOR_ID === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_NO === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.REMOVE_ENEMY_FROM_TOWER_FLOOR === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.ENABLE_HIDING === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.DISABLE_HIDING === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_ID === configAction
  );
};
export const isTowerRaiderWithParamsAction = (action: string) => {
  const actionArr = action.split('-');
  actionArr.pop();
  const configAction = actionArr.join('-');
  return (
    TOWER_SECONDARY_SLACK_ACTIONS.CHOOSE_PERK === configAction ||
    TOWER_SECONDARY_SLACK_ACTIONS.CHOOSE_ITEM.concat('-', actionArr[actionArr.length - ONE]) ===
      configAction
  );
};

export function initiativeSort(actionA: TowerRoundAction, actionB: TowerRoundAction) {
  const characterA = actionA._raider ?? actionA._enemy!;
  const characterB = actionB._raider ?? actionB._enemy!;
  const randomInitiative =
    characterA instanceof TowerRaider
      ? hasLuck(DEFAULT_SORT_INITIATIVE_SUCCESS_RATE, characterA.luckBoost)
      : hasLuck(ENEMY_DEFAULT_SORT_INITIATIVE_SUCCESS_RATE);
  return characterB.abilitiesJSON.initiative - characterA.abilitiesJSON.initiative !== 0
    ? characterB.abilitiesJSON.initiative - characterA.abilitiesJSON.initiative
    : randomInitiative
    ? -1
    : 1;
}

export function defineSearchRarityParamsByFloor(floorNumber: number): RollSearchRarityParams {
  const mutableRollSearchRarityParam: RollSearchRarityParams = {
    rarityRollTable: {},
    searchRarityAvailability: {
      Common: false,
      Rare: false,
      Epic: false,
      Legendary: false,
    },
  };
  const SEARCH_COMMON = 2;
  const SEARCH_COMMON_AND_RARE = 5;
  const SEARCH_COMMON_RARE_AND_EPIC = 8;
  if (floorNumber <= SEARCH_COMMON) {
    mutableRollSearchRarityParam.rarityRollTable = {
      common: { chance: 1, result: ITEM_RARITY.COMMON },
    };
    mutableRollSearchRarityParam!.searchRarityAvailability!.Common = true;
  } else if (floorNumber <= SEARCH_COMMON_AND_RARE) {
    mutableRollSearchRarityParam.rarityRollTable = {
      common: { chance: 0.7, result: ITEM_RARITY.COMMON },
      rare: { chance: 0.3, result: ITEM_RARITY.RARE },
    };
    mutableRollSearchRarityParam!.searchRarityAvailability!.Common = true;
    mutableRollSearchRarityParam!.searchRarityAvailability!.Rare = true;
  } else if (floorNumber <= SEARCH_COMMON_RARE_AND_EPIC) {
    mutableRollSearchRarityParam.rarityRollTable = {
      common: { chance: 0.5, result: ITEM_RARITY.COMMON },
      rare: { chance: 0.3, result: ITEM_RARITY.RARE },
      epic: { chance: 0.2, result: ITEM_RARITY.EPIC },
    };
    mutableRollSearchRarityParam!.searchRarityAvailability!.Common = true;
    mutableRollSearchRarityParam!.searchRarityAvailability!.Rare = true;
    mutableRollSearchRarityParam!.searchRarityAvailability!.Epic = true;
  } else {
    mutableRollSearchRarityParam.rarityRollTable = {
      common: { chance: 0.4, result: ITEM_RARITY.COMMON },
      rare: { chance: 0.3, result: ITEM_RARITY.RARE },
      epic: { chance: 0.2, result: ITEM_RARITY.EPIC },
      legendary: { chance: 0.1, result: ITEM_RARITY.LEGENDARY },
    };
    mutableRollSearchRarityParam!.searchRarityAvailability!.Common = true;
    mutableRollSearchRarityParam!.searchRarityAvailability!.Rare = true;
    mutableRollSearchRarityParam!.searchRarityAvailability!.Epic = true;
    mutableRollSearchRarityParam!.searchRarityAvailability!.Legendary = true;
  }
  return mutableRollSearchRarityParam;
}

export function filterActionsById(actions: TowerRoundAction[], actionId: TOWER_ACTIONS_TYPE) {
  return actions.filter((a) => a._availableActionId === actionId);
}

export function rollEnemyAction(): TOWER_ACTIONS_TYPE | undefined {
  return weightedChance(
    [
      { chance: ENEMY_HIDE_CHANCE, result: TOWER_ACTIONS.HIDE },
      { chance: ENEMY_HUNT_CHANCE, result: TOWER_ACTIONS.HUNT },
    ],
    TOWER_ACTIONS.HIDE
  );
}

export function rollLootPrize(
  lootPrizesAvailable?: TOWER_LOOT_PRIZES[]
): TOWER_LOOT_PRIZES | undefined {
  const defaultPrizes = [
    { chance: LOOT_PRIZE_ITEM_CHANCE, result: TOWER_LOOT_PRIZES.ITEM },
    { chance: LOOT_PRIZE_ARMOR_CHANCE, result: TOWER_LOOT_PRIZES.ARMOR },
    { chance: LOOT_PRIZE_WEAPON_CHANCE, result: TOWER_LOOT_PRIZES.WEAPON },
  ];

  if (!lootPrizesAvailable) {
    return weightedChance(defaultPrizes, TOWER_LOOT_PRIZES.WEAPON);
  }

  const customPrizesAvailable: Array<{ chance: number; result: TOWER_LOOT_PRIZES }> = [];

  lootPrizesAvailable.forEach((lootPrize) => {
    if (lootPrize === TOWER_LOOT_PRIZES.ITEM) {
      customPrizesAvailable.push({
        chance: LOOT_PRIZE_ITEM_CHANCE,
        result: TOWER_LOOT_PRIZES.ITEM,
      });
    }
    if (lootPrize === TOWER_LOOT_PRIZES.ARMOR) {
      customPrizesAvailable.push({
        chance: LOOT_PRIZE_ARMOR_CHANCE,
        result: TOWER_LOOT_PRIZES.ARMOR,
      });
    }
    if (lootPrize === TOWER_LOOT_PRIZES.WEAPON) {
      customPrizesAvailable.push({
        chance: LOOT_PRIZE_WEAPON_CHANCE,
        result: TOWER_LOOT_PRIZES.WEAPON,
      });
    }
  });

  return weightedChance(customPrizesAvailable, TOWER_LOOT_PRIZES.WEAPON);
}

export function rollHealthkit(): TOWER_HEALTHKITS | undefined {
  return weightedChance(
    [
      // { chance: LUCKELIXIR_ITEM_CHANCE, result: ARENA_ITEM.LUCK_ELIXIR },
      { chance: HEALTHKIT_ITEM_CHANCE, result: TOWER_HEALTHKITS.COMMON },
    ],
    TOWER_HEALTHKITS.COMMON
  );
}

export function parseCreateTowerCommandText(commandText: string) {
  const bracesRegExp = new RegExp(/\{(.*?)\}/, 'g');
  const NO_BRACES_AT_START = 1;
  const NO_BRACES_AT_END = 2;
  const RADIX_BASE = 10;
  const [nameInBraces] = commandText.match(bracesRegExp) || [null];
  const towerName =
    nameInBraces?.substr(NO_BRACES_AT_START, nameInBraces.length - NO_BRACES_AT_END) ||
    `The Tower ${random(NO_BRACES_AT_START, HUNDRED)}.${random(ONE, HUNDRED)}`;
  const [lunaPrizeString, coinPrizeString, towerHeightString] = commandText
    .replace(bracesRegExp, '')
    .trim()
    .split(' ');
  const lunaPrize = parseInt(lunaPrizeString, RADIX_BASE);
  const coinPrize = parseInt(coinPrizeString, RADIX_BASE);
  const towerHeight = parseInt(towerHeightString, RADIX_BASE);
  return {
    name: towerName,
    height: !isNaN(towerHeight) ? towerHeight : undefined,
    lunaPrize: !isNaN(lunaPrize) ? lunaPrize : undefined,
    coinPrize: !isNaN(coinPrize) ? coinPrize : undefined,
  };
}

// Messages
export function luckBoostRateToPercentageString(): string {
  return `${Math.round(LUCK_ELIXIR_BOOST * HUNDRED)}%`;
}

export async function publishTowerPublicMessage(message: string) {
  const theTowerChannel = getConfig(TOWER_SLACK_CHANNEL);
  const requestBody = { response_type: 'in_channel', text: message };
  await slackRequest(theTowerChannel, requestBody);
  return { xhqChannel: theTowerChannel, requestBody };
}

export function theTowerNotifyInPrivate(
  message: string,
  userTo: string,
  blocks?: SlackBlockKitLayoutElement[]
) {
  return notifyInPrivate(message, userTo, 'SLACK_TOWER_TOKEN', blocks);
}

export function theTowerUnfurlLink(unfurlInfo: object) {
  return chatUnfurl(unfurlInfo, getConfig('SLACK_TOWER_TOKEN'));
}

export function theTowerNotifyEphemeral(
  message: string,
  userTo: string,
  channel: string,
  blocks?: SlackBlockKitLayoutElement[]
) {
  return notifyEphemeral(message, userTo, channel, getConfig('SLACK_TOWER_TOKEN'), blocks);
}

export async function theTowerOpenView(requestBody: object) {
  return openView(requestBody, getConfig('SLACK_TOWER_TOKEN'));
}

// DATABASE
export function withTowerTransaction<T>(fn: (transaction: Transaction) => Promise<T>) {
  return withTransaction((transaction) => {
    return fn(transaction).catch(async (error) => {
      if (error instanceof GameError) {
        error.addRepository(TOWER_REPOSITORY_NAME);
      }
      throw error;
    });
  });
}
