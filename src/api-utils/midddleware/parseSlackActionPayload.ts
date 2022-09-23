// import Querystring from 'querystring';

import Boom from '@hapi/boom';
import type { Lifecycle, Request } from '@hapi/hapi';

import { slackActionsPayloadSchema } from '../../games/model/SlackActionPayload';
import type { SlackActionsPayload } from '../../games/model/SlackActionPayload';
import { slackBlockPayloadSchema } from '../../games/model/SlackBlockKit';
import type { SlackBlockKitPayload } from '../../games/model/SlackBlockKitPayload';
import type { SlackDialogSubmissionPayload } from '../../games/model/SlackDialogObject';
import { slackSSDialogSubmissionPayloadSchema } from '../../games/model/SlackDialogObject';
import type { SlackDialogsPayload } from '../../games/model/SlackDialogPayload';
import { slackDialogsPayloadSchema } from '../../games/model/SlackDialogPayload';
import type { SlackShortcutPayload } from '../../games/model/SlackShortcutPayload';
import { slackSShortcutPayloadSchema } from '../../games/model/SlackShortcutPayload';
import { checkForSlackErrors } from '../utils';

export function parseSlackActionPayload(request: Request): Lifecycle.Method {
  if (!Buffer.isBuffer(request.payload)) {
    throw Boom.internal('Payload is not a Buffer');
  }

  const body = new URLSearchParams(request.payload.toString('utf-8'));
  console.log({ body });
  const payload = {} as any;
  body.forEach((value, name) => (payload[name] = value));

  const parsed:
    | SlackActionsPayload
    | SlackDialogsPayload
    | SlackBlockKitPayload
    | SlackShortcutPayload
    | SlackDialogSubmissionPayload = payload;
  console.log('HELLO 1');
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
  console.log('HELLO 2', { mutableSlackPayload });
  checkForSlackErrors(mutableSlackPayload, parsed);
  console.log('HELLO 3');
  return mutableSlackPayload.value;
}
