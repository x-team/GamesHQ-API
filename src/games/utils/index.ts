import { random } from 'lodash';
import type { Transaction } from 'sequelize';
import { WebClient } from '@slack/client';
import fetch from 'node-fetch';
import { User } from '../../models';

import type { GAME_TYPE } from '../consts/global';
import { HUNDRED } from '../consts/global';
import { getConfig, logger } from '../../config';
import { SlackBlockKitLayoutElement } from '../model/SlackBlockKit';
import { sequelize } from '../../db';

// DATABASE
export function withTransaction<T>(fn: (transaction: Transaction) => Promise<T>) {
  return sequelize.transaction((transaction) => {
    return fn(transaction).catch(async (error) => {
      if (error.data?.repository) {
        logger.error(`Error in ${error.data.repository}`);
      }
      logger.error(error);
    });
  });
}

// OPERATIONS
export function rateToPercentage(rate: number): string {
  return `${Math.round(rate * HUNDRED)}%`;
}

export function generateRandomNameForGame(gameType: GAME_TYPE) {
  return `${gameType} ${random(HUNDRED)}.${random(HUNDRED)}.${random(HUNDRED)}`;
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
