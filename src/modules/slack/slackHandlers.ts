import type { Lifecycle } from '@hapi/hapi';
import { SLACK_COMMAND_TESTING_PREFIX } from '../../consts/api';
import { SlackSlashCommandPayload } from '../../games/model/SlackSlashCommandPayload';
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
