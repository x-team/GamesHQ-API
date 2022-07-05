import type { Lifecycle } from '@hapi/hapi';

import { logger } from '../../config';
import { arenaSwitchCommand } from '../../games/arena/commands';
import { isArenaCommand } from '../../games/arena/utils';
import { SAD_PARROT } from '../../games/consts/emojis';
import { gamesSwitchCommand } from '../../games/general/commands';
import type { SlackSlashCommandPayload } from '../../games/model/SlackSlashCommandPayload';
import { towerSwitchCommand } from '../../games/tower/commands';
import { isGamesHQCommand, isTowerCommand } from '../../games/tower/utils';
import type { GameResponse } from '../../games/utils';
import { getEphemeralBlock, getEphemeralText } from '../../games/utils';
import { getUserBySlackId } from '../../models/User';

export function gameResponseToSlackHandler(response: GameResponse | void) {
  if (!response) {
    const unknownCommandSent = `${SAD_PARROT} unknown command`;
    logger.error(unknownCommandSent);
    return getEphemeralText(unknownCommandSent);
  }

  const defaultErrorMessage = 'Something Wrong Happened';
  if (response.type === 'error') {
    logger.error(response);
    return getEphemeralText(response.text ?? defaultErrorMessage);
  }
  if (response.blocks) {
    return getEphemeralBlock(response.blocks);
  }
  return getEphemeralText(response.text ?? defaultErrorMessage);
}

export const slackCommandSwitcher = async (
  payload: SlackSlashCommandPayload
): Promise<Lifecycle.ReturnValue> => {
  const guestCommands = ['/games-register'];
  const { command, user_id, /*response_url,*/ text, trigger_id, channel_id } = payload;

  let mutableResponse: void | GameResponse;
  const errorMessage = `${SAD_PARROT} User with slack ID: <@${user_id}> not found`;
  const userRequesting = await getUserBySlackId(user_id);
  if (!userRequesting && !guestCommands.includes(command)) {
    return getEphemeralText(errorMessage);
  }

  if (isGamesHQCommand(command)) {
    mutableResponse = await gamesSwitchCommand({
      command,
      slackId: user_id,
      commandText: text,
      channelId: channel_id,
      triggerId: trigger_id,
    });

    return gameResponseToSlackHandler(mutableResponse);
  }

  if (!userRequesting) {
    return getEphemeralText(errorMessage);
  }

  if (isArenaCommand(command)) {
    mutableResponse = await arenaSwitchCommand({
      command,
      commandText: text,
      userRequesting,
      channelId: channel_id,
      triggerId: trigger_id,
    });
  }

  if (isTowerCommand(command)) {
    mutableResponse = await towerSwitchCommand({
      command,
      commandText: text,
      userRequesting,
      triggerId: trigger_id,
    });
  }

  // if (isCampaignCommand(command)) {
  //   return campaignSwitchCommand({
  //     command,
  //     commandText: text,
  //     userRequesting: mutableUserRequesting,
  //     triggerId: trigger_id,
  //   }) as SlackResponse;
  // }

  // if (isVersusCommand(command)) {
  //   return versusSwitchCommand({
  //     command,
  //     commandText: text,
  //     userRequesting: mutableUserRequesting,
  //   });
  // }

  return gameResponseToSlackHandler(mutableResponse);
};
