import Boom from '@hapi/boom';
import type { ValidationResult } from 'joi';
import type { Model } from 'sequelize-typescript';

import type { SlackActionsPayload } from '../games/model/SlackActionPayload';
import type { SlackBlockKitPayload } from '../games/model/SlackBlockKitPayload';
import type { SlackChallengesPayload } from '../games/model/SlackChallengePayload';
import type { SlackDialogSubmissionPayload } from '../games/model/SlackDialogObject';
import type { SlackDialogsPayload } from '../games/model/SlackDialogPayload';
import type { SlackEventsPayload } from '../games/model/SlackEventPayload';
import type { SlackShortcutPayload } from '../games/model/SlackShortcutPayload';
import type { SlackSlashCommandPayload } from '../games/model/SlackSlashCommandPayload';

export const arrayToJSON = <T extends Model>(entities: Array<T>) => {
  return entities.map((entity) => entity.toJSON());
};

export const isRequestFresh = (timestamp: number, freshMinutes?: number): boolean => {
  const SIXTY_SECONDS = 60;
  const FIVE = 5;
  const MILLIS_TO_SECONDS = 1000;
  const FRESH_MINUTES = SIXTY_SECONDS * (freshMinutes ?? FIVE);
  return Date.now() / MILLIS_TO_SECONDS - timestamp < FRESH_MINUTES;
};

export const checkForSlackErrors = (
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
