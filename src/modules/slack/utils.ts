import Querystring from 'querystring';

import Boom from '@hapi/boom';
import type { Lifecycle, Request, ResponseToolkit } from '@hapi/hapi';
import type { ValidationResult } from 'joi';
import { endsWith } from 'lodash';

import { getConfig, logger } from '../../config';
import { arenaSwitchCommand } from '../../games/arena/commands';
import { isArenaCommand } from '../../games/arena/utils';
import { SAD_PARROT } from '../../games/consts/emojis';
import { gamesSwitchCommand } from '../../games/general/commands';
import { slackActionsPayloadSchema } from '../../games/model/SlackActionPayload';
import type { SlackActionsPayload } from '../../games/model/SlackActionPayload';
import { slackBlockPayloadSchema } from '../../games/model/SlackBlockKit';
import type { SlackBlockKitPayload } from '../../games/model/SlackBlockKitPayload';
import type { SlackChallengesPayload } from '../../games/model/SlackChallengePayload';
import { slackChallengesPayloadSchema } from '../../games/model/SlackChallengePayload';
import type { SlackDialogSubmissionPayload } from '../../games/model/SlackDialogObject';
import { slackSSDialogSubmissionPayloadSchema } from '../../games/model/SlackDialogObject';
import type { SlackDialogsPayload } from '../../games/model/SlackDialogPayload';
import { slackDialogsPayloadSchema } from '../../games/model/SlackDialogPayload';
import type { SlackEventsPayload } from '../../games/model/SlackEventPayload';
import { slackEventsPayloadSchema } from '../../games/model/SlackEventPayload';
import type { SlackShortcutPayload } from '../../games/model/SlackShortcutPayload';
import { slackSShortcutPayloadSchema } from '../../games/model/SlackShortcutPayload';
import type { SlackSlashCommandPayload } from '../../games/model/SlackSlashCommandPayload';
import { slackSlashCommandPayloadSchema } from '../../games/model/SlackSlashCommandPayload';
import { towerSwitchCommand } from '../../games/tower/commands';
import { isGamesHQCommand, isTowerCommand } from '../../games/tower/utils';
import type { GameResponse } from '../../games/utils';
import { getEphemeralBlock, getEphemeralText } from '../../games/utils';
import { getUserBySlackId } from '../../models/User';
import type { SlackConfigKey } from '../../utils/cryptography';
import { validateWebhookSignatures } from '../../utils/cryptography';

export const isRequestFresh = (timestamp: number, freshMinutes?: number): boolean => {
  const SIXTY_SECONDS = 60;
  const FIVE = 5;
  const MILLIS_TO_SECONDS = 1000;
  const FRESH_MINUTES = SIXTY_SECONDS * (freshMinutes ?? FIVE);
  return Date.now() / MILLIS_TO_SECONDS - timestamp < FRESH_MINUTES;
};

const getAppSigningSecretKeyForPath = (request: Request): SlackConfigKey | undefined => {
  const isCampaignCommand = endsWith(request.path, '/cmp-commands');
  const isCampaignAction = endsWith(request.path, '/cmp-actions');
  const isTowerCommand = endsWith(request.path, '/tower-commands');
  const isTowerAction = endsWith(request.path, '/tower-actions');
  const isTowerEvents = endsWith(request.path, '/tower-events');
  const isArenaCommand = endsWith(request.path, '/arena-commands');
  const isArenaAction = endsWith(request.path, '/arena-actions');
  const isGamesHqCommand = endsWith(request.path, '/gameshq-commands');

  if (isCampaignCommand || isCampaignAction) {
    return 'SLACK_CAMPAIGN_SIGNING_SECRET';
  }
  if (isTowerAction || isTowerCommand || isTowerEvents) {
    return 'SLACK_TOWER_SIGNING_SECRET';
  }
  if (isArenaCommand || isArenaAction) {
    return 'SLACK_ARENA_SIGNING_SECRET';
  }
  if (isGamesHqCommand) {
    return 'FRONT_END_SIGNING_SECRET';
  }

  return undefined;
};

/**
 * @see https://api.slack.com/docs/verifying-requests-from-slack#step-by-step_walk-through_for_validating_a_request
 */
export function verifySlackRequest(request: Request, h: ResponseToolkit) {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }
  const timestamp = Number(request.headers['x-slack-request-timestamp']);
  if (!isRequestFresh(timestamp)) {
    throw Boom.unauthorized('Invalid timestamp');
  }
  const body = request.payload.toString('utf-8');
  const version = 'v0';
  const slackSignature = request.headers['x-slack-signature'];

  const signatureBase = `${version}:${timestamp}:${body}`;

  const appSecretKey = getAppSigningSecretKeyForPath(request);

  if (!appSecretKey) {
    throw Boom.notAcceptable('APP SIGNING SECRET not acceptable');
  }

  const appSecretKeyHash = getConfig(appSecretKey);
  const isValid = validateWebhookSignatures(
    appSecretKeyHash,
    slackSignature,
    signatureBase,
    version
  );

  if (!isValid) {
    throw Boom.unauthorized('Invalid signature');
  }
  return h.continue;
}

const checkForSlackErrors = (
  validationResult: ValidationResult,
  parsed:
    | SlackSlashCommandPayload
    | SlackActionsPayload
    | SlackDialogsPayload
    | SlackBlockKitPayload
    | SlackChallengesPayload
    | SlackEventsPayload
    | SlackShortcutPayload
    | SlackDialogSubmissionPayload
) => {
  if (validationResult.error) {
    throw Boom.boomify(validationResult.error, { statusCode: 400, data: { parsed } });
  }
};

export function parseSlashCommandPayload(request: Request): Lifecycle.Method {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = request.payload.toString('utf-8');
  const parsed = Querystring.parse(body) as unknown as SlackSlashCommandPayload;

  const slashCommandPayload = slackSlashCommandPayloadSchema.validate(parsed, {
    stripUnknown: true,
  });

  checkForSlackErrors(slashCommandPayload, parsed);

  return slashCommandPayload.value;
}

export function parseSlackActionPayload(request: Request): Lifecycle.Method {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = request.payload.toString('utf-8');
  const { payload } = Querystring.parse(body);

  const parsed:
    | SlackActionsPayload
    | SlackDialogsPayload
    | SlackBlockKitPayload
    | SlackShortcutPayload
    | SlackDialogSubmissionPayload = JSON.parse(payload as string);

  let mutableSlackPayload;
  switch (parsed.type) {
    case 'message_action':
      mutableSlackPayload = slackActionsPayloadSchema.validate(parsed as SlackActionsPayload, {
        stripUnknown: true,
      });
      break;
    case 'block_actions':
      mutableSlackPayload = slackBlockPayloadSchema.validate(parsed as SlackBlockKitPayload, {
        stripUnknown: true,
      });
      break;
    case 'shortcut':
      mutableSlackPayload = slackSShortcutPayloadSchema.validate(parsed as SlackShortcutPayload, {
        stripUnknown: true,
      });
      break;
    case 'view_submission':
      mutableSlackPayload = slackSSDialogSubmissionPayloadSchema.validate(
        parsed as SlackDialogSubmissionPayload,
        {
          stripUnknown: true,
        }
      );
      break;
    default:
      const { view }: SlackActionsPayload = parsed as SlackActionsPayload;
      mutableSlackPayload =
        view && view.callback_id === 'modal-appreciation'
          ? slackActionsPayloadSchema.validate(parsed as SlackActionsPayload, {
              stripUnknown: true,
            })
          : slackDialogsPayloadSchema.validate(parsed as SlackDialogsPayload, {
              stripUnknown: true,
            });
      break;
  }
  checkForSlackErrors(mutableSlackPayload, parsed);
  return mutableSlackPayload.value;
}

export const parseSlackEventPayload: Lifecycle.Method = (request) => {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = request.payload.toString('utf-8');
  const { payload } = Querystring.parse(body);

  const parsed: SlackChallengesPayload | SlackEventsPayload = JSON.parse(payload as string);

  const slackEventPayload = parsed.challenge
    ? slackChallengesPayloadSchema.validate(parsed, { stripUnknown: true })
    : slackEventsPayloadSchema.validate(parsed, { stripUnknown: true });

  checkForSlackErrors(slackEventPayload, parsed);

  return slackEventPayload.value;
};

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
