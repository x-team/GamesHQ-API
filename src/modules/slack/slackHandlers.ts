import type { Lifecycle } from '@hapi/hapi';

import { SLACK_COMMAND_TESTING_PREFIX } from '../../consts/api';
import { handleArenaAction, handleViewSubmissionAction } from '../../games/arena/actions';
import type { SlackSlashCommandPayload } from '../../games/model/SlackSlashCommandPayload';

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
    SLACK_COMMAND_TESTING_PREFIX,
    '/'
  );

  try {
    return slackCommandSwitcher(slashCommandPayload);
  } catch (err) {
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
  } catch (err) {
    err.data = slackActionPayload;
    throw err;
  }
};

export const towerSlackActionHandler: Lifecycle.Method = async (_request, _h) => {
  // const slackActionPayload = request.pre.slackActionsPayload;
  // try {
  //   switch (slackActionPayload.type) {
  //     case 'shortcut':
  //       return handleTowerShortcut(slackActionPayload as SlackShortcutPayload);
  //     case 'view_submission':
  //       return handleTowerAction(slackActionPayload as SlackDialogSubmissionPayload);
  //     case 'block_actions':
  //       return handleTowerBlockAction(slackActionPayload as SlackBlockPayload);
  //     default:
  //       throw Boom.internal('Unknown payload');
  //   }
  // } catch (err) {
  //   err.data = slackActionPayload;
  //   throw err;
  // }
};
