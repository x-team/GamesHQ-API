import { getGameResponse } from '../../utils';
import { GAMES_SLACK_COMMANDS } from '../consts';

import { register } from './register';

interface GamesHQSwitchCommandOptions {
  command: string;
  commandText: string;
  slackId: string;
  channelId: string;
  triggerId: string;
}

export function gamesSwitchCommand({ command, slackId }: GamesHQSwitchCommandOptions) {
  switch (command) {
    // ADMIN
    case GAMES_SLACK_COMMANDS.REGISTER:
      return register(slackId);

    default:
      return getGameResponse('Invalid command.');
  }
}
