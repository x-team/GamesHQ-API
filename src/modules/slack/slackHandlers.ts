import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';
import { random } from 'lodash';

import { SLACK_COMMAND_LOCAL_PREFIX, SLACK_COMMAND_STAGING_PREFIX } from '../../consts/api';
import { handleArenaAction, handleViewSubmissionAction } from '../../games/arena/actions';
import { HUNDRED, ZERO } from '../../games/consts/global';
import type { SlackChallengesPayload } from '../../games/model/SlackChallengePayload';
import type { SlackChatUnfurlUrl } from '../../games/model/SlackChatUnfurlPayload';
import type { SlackEventsPayload } from '../../games/model/SlackEventPayload';
import type { SlackSlashCommandPayload } from '../../games/model/SlackSlashCommandPayload';
import { handleTowerBlockAction } from '../../games/tower/actions';
import { handleTowerAction } from '../../games/tower/actions/towerAction';
import { theTowerUnfurlLink } from '../../games/tower/utils';
import { blockKitCompositionImage } from '../../games/utils/generators/slack';

import { slackCommandSwitcher } from './utils';

export const testRouteHandler: Lifecycle.Method = async () => {
  return {
    data: {
      message: 'Hello from the server',
    },
  };
};

export const slackCommandHandler: Lifecycle.Method = async (request, _h) => {
  const slashCommandPayload: SlackSlashCommandPayload = request.pre.slashCommandPayload;
  slashCommandPayload.command = slashCommandPayload.command?.replace(
    SLACK_COMMAND_STAGING_PREFIX,
    '/'
  );
  slashCommandPayload.command = slashCommandPayload.command?.replace(
    SLACK_COMMAND_LOCAL_PREFIX,
    '/'
  );

  try {
    return slackCommandSwitcher(slashCommandPayload);
  } catch (err: any) {
    err.data = slashCommandPayload;
    throw err;
  }
};

export const arenaSlackActionHandler: Lifecycle.Method = async (request, _h) => {
  const slackActionPayload = request.pre.slackActionPayload;

  try {
    switch (slackActionPayload.type) {
      case 'view_submission':
        return handleViewSubmissionAction(slackActionPayload);
      default:
        return handleArenaAction(slackActionPayload);
    }
  } catch (err: any) {
    err.data = slackActionPayload;
    throw err;
  }
};

export const towerSlackActionHandler: Lifecycle.Method = async (request, _h) => {
  const slackActionPayload = request.pre.slackActionPayload;
  try {
    switch (slackActionPayload.type) {
      case 'shortcut':
      // // return handleTowerShortcut(slackActionPayload as SlackShortcutPayload);
      case 'view_submission':
        return handleTowerAction(slackActionPayload);
      case 'block_actions':
        return handleTowerBlockAction(slackActionPayload);
      default:
        throw Boom.internal('Unknown payload');
    }
  } catch (err: any) {
    err.data = slackActionPayload;
    throw err;
  }
};

export const towerSlackEventHandler: Lifecycle.Method = async (request, _h) => {
  const { challenge, type }: SlackChallengesPayload | SlackEventsPayload =
    request.pre.slackEventsPayload;
  try {
    if (type === 'event_callback') {
      const payload = request.pre.slackEventsPayload;
      switch (payload.event.type) {
        case 'link_shared':
          const eventLinks = payload.event.links as { domain: string; url: string }[];
          const unfurlUrlInfo: SlackChatUnfurlUrl = {
            channel: payload.event.channel,
            ts: payload.event.message_ts,
            unfurls: Object.assign(
              {},
              ...eventLinks.map((link) => ({
                [link.url]: {
                  blocks: [
                    blockKitCompositionImage(
                      link.url,
                      `The Tower Gif ${random(ZERO, HUNDRED)}.${random(ZERO, HUNDRED)}`
                    ),
                  ],
                },
              }))
            ),
          };
          const response: { ok: boolean; error?: string | undefined } = await theTowerUnfurlLink(
            unfurlUrlInfo
          );
          if (!response.ok) {
            throw Boom.internal(response.error || 'Error in ChatUnfurl');
          }
          return null;
        default:
          return null;
      }
    }
    return {
      challenge,
    };
  } catch (err: any) {
    err.data = request.pre.slackEventsPayload;
    throw err;
  }
};
