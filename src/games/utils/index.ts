import { URLSearchParams } from 'url';

import { WebClient } from '@slack/client';
import { random } from 'lodash';
import fetch from 'node-fetch';
import type { Transaction } from 'sequelize';

import { getConfig, logger } from '../../config';
import { sequelize } from '../../db';
import type { User } from '../../models';
import { parseEscapedSlackUserValues } from '../../utils/slack';
import { ZERO, HUNDRED } from '../consts/global';
import type { SlackBlockKitLayoutElement } from '../model/SlackBlockKit';

import { GameError } from './GameError';

// DATABASE
export function withTransaction<T>(fn: (transaction: Transaction) => Promise<T>) {
  return sequelize
    .transaction((transaction) => {
      return fn(transaction);
    })
    .catch(async (error) => {
      if (error instanceof GameError) {
        logger.error(`Error in ${error.repository ?? 'Undefined Repository'}`);
        return getGameError(error.message);
      }
      logger.error(error);
      throw error;
    });
}

// OPERATIONS

export function nonLessThanZeroParam(value: number) {
  return Math.max(value, ZERO);
}

export const extractSecondaryAction = (action: string) => {
  const actionArr = action.split('-');
  const value = actionArr.pop();
  return { action: actionArr.join('-'), selectedId: value };
};

export function rateToPercentage(rate: number): string {
  return `${Math.round(rate * HUNDRED)}%`;
}

export function generateRandomNameForGame(gameTypeName: string) {
  return `${gameTypeName} ${random(HUNDRED)}.${random(HUNDRED)}.${random(HUNDRED)}`;
}

export function hasLuck(successRate: number, boost = 0): boolean {
  return Math.random() < successRate + boost;
}

export function damageIncrease(damage: number, increaseRate: number): number {
  return Math.round(damage * increaseRate);
}

export function damageReduction(damage: number, reductionRate: number): number {
  return Math.round(damage * reductionRate);
}

export function adminAction(userRequesting: User): boolean {
  return !!(
    userRequesting.isSuperAdmin() ||
    userRequesting.isAdmin() ||
    userRequesting.isCommunityTeam()
  );
}

export interface GameResponse {
  type: 'response' | 'error';
  text?: string;
  blocks?: SlackBlockKitLayoutElement[];
}

export function getGameResponse(response: string | SlackBlockKitLayoutElement[]): GameResponse {
  const gameResponse: GameResponse = {
    type: 'response',
  };
  const isText = typeof response === 'string';
  if (isText) {
    gameResponse['text'] = response as string;
  } else {
    gameResponse['blocks'] = response as SlackBlockKitLayoutElement[];
  }
  return gameResponse;
}

export function getGameError(message: string): GameResponse {
  return {
    type: 'error',
    text: message,
  };
}

export function parseCommandTextToSlackIds(commandText: string, scapeSlackIds = true) {
  const wrappedSlackIds = new Set<string>();
  commandText.split(/\s+/).forEach((identifier) => wrappedSlackIds.add(identifier.trim()));
  return scapeSlackIds
    ? Array.from(wrappedSlackIds).map((slackId) => parseEscapedSlackUserValues(slackId) as string)
    : Array.from(wrappedSlackIds);
}

// SLACK REQUESTS
export interface SlackResponse {
  response_type: string;
  text?: string;
  blocks?: SlackBlockKitLayoutElement[];
}

export function getEphemeralText(text: string): SlackResponse {
  return {
    response_type: 'ephemeral',
    text,
  };
}

export function getEphemeralBlock(blocks: SlackBlockKitLayoutElement[]): SlackResponse {
  return {
    response_type: 'ephemeral',
    blocks,
  };
}

export async function slackRequest(responseUrl: string, requestBody: SlackResponse) {
  try {
    const url = responseUrl;
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    };
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    logger.error('Error in slackRequest()');
    logger.error(error);
    throw error;
  }
}

export async function chatUnfurl(requestBody: object, bearer: string = getConfig('SLACK_TOKEN')) {
  try {
    const url = 'https://slack.com/api/chat.unfurl';
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(requestBody),
    };
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    logger.error('Error in chatUnfurl()');
    logger.error(error);
    throw error;
  }
}

export async function getSlackUserInfo(slackId: string) {
  try {
    const url = 'https://slack.com/api/users.info';
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${getConfig('FRONT_END_APP_BOT_TOKEN')}`,
      },
      body: new URLSearchParams({
        user: slackId,
      }),
    };
    const response = await fetch(url, options);
    return response.json();
  } catch (error) {
    logger.error('Error in getSlackUserInfo()');
    logger.error(error);
    throw error;
  }
}

export const notifyInPrivate = async (
  message: string,
  userTo: string,
  slackApp: 'SLACK_ARENA_TOKEN' | 'SLACK_TOWER_TOKEN',
  blocks?: SlackBlockKitLayoutElement[]
) => {
  const channel = userTo;
  const slackToken = getConfig(slackApp);
  const web = new WebClient(slackToken);

  const res = await web.chat.postMessage({ channel, text: message, blocks });
  if (!res.ok) {
    throw new Error(res.error);
  }
  return res;
};

export async function notifyEphemeral(
  message: string,
  userTo: string,
  channel: string,
  slackToken: string,
  blocks?: SlackBlockKitLayoutElement[]
) {
  const web = new WebClient(slackToken);

  return web.chat.postEphemeral({ user: userTo, channel, text: message, blocks });
}

export async function openView(requestBody: object, bearer: string = getConfig('SLACK_TOKEN')) {
  try {
    const url = 'https://slack.com/api/views.open';
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(requestBody),
    };
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    logger.error('Error in openView()');
    logger.error(error);
    throw error;
  }
}
