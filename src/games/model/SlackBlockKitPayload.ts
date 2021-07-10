import { SlackBlockKitButtonElement, SlackBlockKitSelectMenuElement } from './SlackBlockKit';
import { SLackDialogSubmission } from './SlackDialogObject';

export interface SlackBlockKitPayload {
  token: string;
  type: string;
  response_url: string;
  trigger_id: string;
  view: SLackDialogSubmission;
  api_app_id: string;
  team: {
    id: string;
    domain: string;
  };
  channel: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    username: string;
    team_id: string;
  };
  container: {
    type: string;
    message_ts: string;
    channel_id: string;
    is_ephemeral: boolean;
  };
  actions: Array<SlackBlockKitSelectMenuElement | SlackBlockKitButtonElement>;
}
