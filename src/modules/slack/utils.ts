import Boom from '@hapi/boom';
import Querystring from 'querystring';
import type { Lifecycle, Request, ResponseToolkit } from '@hapi/hapi';
import type { ValidationResult } from 'joi';
import { SAD_PARROT } from '../../games/consts/emojis';

import {
  SlackSlashCommandPayload,
  slackSlashCommandPayloadSchema,
} from '../../games/model/SlackSlashCommandPayload';
import { isArenaCommand } from '../../games/arena/utils';
import { getUserBySlackId } from '../../models/User';
import { arenaSwitchCommand } from '../../games/arena/commands';
import { endsWith } from 'lodash';
import { SlackConfigKey, validateSlackSignatures } from '../../utils/cryptography';
import { SlackActionsPayload } from '../../games/model/SlackActionPayload';
import {
  SlackDialogsPayload,
  slackDialogsPayloadSchema,
} from '../../games/model/SlackDialogPayload';
import { SlackBlockKitPayload } from '../../games/model/SlackBlockKitPayload';
import { SlackChallengesPayload } from '../../games/model/SlackChallengePayload';
import { SlackEventsPayload } from '../../games/model/SlackEventPayload';
import {
  SlackDialogSubmissionPayload,
  slackSSDialogSubmissionPayloadSchema,
} from '../../games/model/SlackDialogObject';
import {
  SlackShortcutPayload,
  slackSShortcutPayloadSchema,
} from '../../games/model/SlackShortcutPayload';
import { slackActionsPayloadSchema } from '../../games/model/SlackActionPayload';
import { GameResponse, getEphemeralBlock, getEphemeralText } from '../../games/utils';
import { logger } from '../../config';
import { slackBlockPayloadSchema } from '../../games/model/SlackBlockKit';

export const isRequestFresh = (timestamp: number): boolean => {
  const SIXTY_SECONDS = 60;
  const FIVE = 5;
  const MILLIS_TO_SECONDS = 1000;
  const FIVE_MINUTES = SIXTY_SECONDS * FIVE;
  return Date.now() / MILLIS_TO_SECONDS - timestamp < FIVE_MINUTES;
};

const getAppSigningSecretKeyForPath = (request: Request): SlackConfigKey | undefined => {
  const isCampaignCommand = endsWith(request.path, '/cmp-commands');
  const isCampaignAction = endsWith(request.path, '/cmp-actions');
  const isTowerCommand = endsWith(request.path, '/tower-commands');
  const isTowerAction = endsWith(request.path, '/tower-actions');
  const isTowerEvents = endsWith(request.path, '/tower-events');
  const isArenaCommand = endsWith(request.path, '/arena-commands');
  const isArenaAction = endsWith(request.path, '/arena-actions');

  if (isCampaignCommand || isCampaignAction) {
    return 'SLACK_CAMPAIGN_SIGNING_SECRET';
  }
  if (isTowerAction || isTowerCommand || isTowerEvents) {
    return 'SLACK_TOWER_SIGNING_SECRET';
  }
  if (isArenaCommand || isArenaAction) {
    return 'SLACK_ARENA_SIGNING_SECRET';
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
  const isValid = validateSlackSignatures(appSecretKey, slackSignature, signatureBase, version);

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
  const { command, user_id, /*response_url,*/ text, trigger_id, channel_id } = payload;

  let mutableResponse: void | GameResponse;
  const errorMessage = `${SAD_PARROT} User with slack ID: <@${user_id}> not found`;
  const userRequesting = await getUserBySlackId(user_id);
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

  // if (isTowerCommand(command)) {
  //   return towerSwitchCommand({
  //     command,
  //     commandText: text,
  //     userRequesting: mutableUserRequesting,
  //     triggerId: trigger_id,
  //   }) as SlackResponse;
  // }
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
