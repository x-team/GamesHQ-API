import Joi from 'joi';

/*
Main structure of a Block Kit:
  Slack Block =
    Array of Slack Layout
    =>
      Slack Layout =
        SlackElements and SlackCompositionElements
      =>
        SlackElement =
          SlackCompositionElements
*/

export interface SlackConfirmDialog {
  title: SlackBlockKitCompositionTextOnly;
  text: SlackBlockKitCompositionTextOnly;
  confirm: SlackBlockKitCompositionTextOnly;
  deny: SlackBlockKitCompositionTextOnly;
  style?: string;
}

export interface SlackBlockKitCompositionImage {
  type: 'image';
  image_url: string;
  alt_text: string;
}

export interface SlackBlockKitCompositionTextOnly {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
}

export interface SlackBlockKitCompositionOption {
  text: SlackBlockKitCompositionTextOnly;
  value: string;
  description?: SlackBlockKitCompositionTextOnly;
  url?: string;
}

export interface SlackBlockKitInitialOption {
  text: {
    type: 'plain_text';
    text: string;
  };
  value: string;
}

export interface SlackBlockKitCompositionOptionGroup {
  label: SlackBlockKitCompositionTextOnly;
  options: SlackBlockKitCompositionOption[];
}

export interface SlackBlockKitElement {
  type: string;
  action_id: string;
}

export interface SlackBlockKitInputTextElement extends SlackBlockKitElement {
  type: 'plain_text_input';
  placeholder?: SlackBlockKitCompositionTextOnly;
  initial_value?: string;
  multiline?: boolean;
  min_length?: number;
  max_length?: number;
  // dispatch_action_config: BlockKitPayload
}

export interface SlackBlockKitMultiSelectMenuElement extends SlackBlockKitElement {
  type: 'multi_static_select';
  placeholder: SlackBlockKitCompositionTextOnly;
  options: SlackBlockKitCompositionOption[];
  initial_options: SlackBlockKitInitialOption[];
}

export interface SlackBlockKitSelectMenuElement extends SlackBlockKitElement {
  type: 'static_select';
  placeholder: SlackBlockKitCompositionTextOnly;
  initial_option?: SlackBlockKitCompositionOption;
  options: SlackBlockKitCompositionOption[];
  option_groups?: SlackBlockKitCompositionOptionGroup[];
  block_id?: string;
  selected_option?: SlackBlockKitCompositionOption;
  selected_options?: SlackBlockKitCompositionOption[];
  action_ts?: string;
  // Pending to define (we don't need it right now)
  // confirm?: SlackTextOnly | SlackConfirmDialog | SlackOption | SlackOptionGroup | SlackFilter
}

export interface SlackBlockKitButtonElement extends SlackBlockKitElement {
  type: 'button';
  text: SlackBlockKitCompositionTextOnly;
  url?: string;
  value?: string;
  style?: 'primary' | 'danger';
  confirm?: SlackConfirmDialog;
}

export interface SlackBlockKitLayout {
  type: string;
  block_id?: string;
}

export interface SlackBlockKitDividerLayout extends SlackBlockKitLayout {
  type: 'divider';
}

export interface SlackBlockKitActionLayout extends SlackBlockKitLayout {
  type: 'actions';
  elements: Array<SlackBlockKitSelectMenuElement | SlackBlockKitButtonElement>;
}

export interface SlackBlockKitSectionLayout extends SlackBlockKitLayout {
  type: 'section';
  text: SlackBlockKitCompositionTextOnly;
  fields?: SlackBlockKitCompositionTextOnly[];
  accessory?:
    | SlackBlockKitMultiSelectMenuElement
    | SlackBlockKitSelectMenuElement
    | SlackBlockKitButtonElement
    | SlackBlockKitCompositionImage;
}

export interface SlackBlockKitHeaderLayout extends SlackBlockKitLayout {
  type: 'header';
  text: SlackBlockKitCompositionTextOnly;
}

export interface SlackBlockKitContextLayout extends SlackBlockKitLayout {
  type: 'context';
  elements: SlackBlockKitCompositionTextOnly[];
}

export interface SlackBlockKitInputLayout {
  type: 'input';
  label: SlackBlockKitCompositionTextOnly;
  element:
    | SlackBlockKitSelectMenuElement
    | SlackBlockKitInputTextElement
    | SlackBlockKitMultiSelectMenuElement;
  dispatch_action?: boolean;
  block_id?: string;
  hint?: SlackBlockKitCompositionTextOnly;
  optional?: boolean;
}

export type SlackBlockKitLayoutElement =
  | SlackBlockKitDividerLayout
  | SlackBlockKitActionLayout
  | SlackBlockKitSectionLayout
  | SlackBlockKitContextLayout
  | SlackBlockKitHeaderLayout
  | SlackBlockKitInputLayout;

export const slackBlockPayloadSchema = Joi.object({
  token: Joi.string().required().allow(''),
  api_app_id: Joi.string().optional().allow(''),
  response_url: Joi.string().optional().allow(''),
  trigger_id: Joi.string().required().allow(''),
  type: Joi.string().required().allow(''),
  user: Joi.object({
    id: Joi.string().required().allow(''),
    name: Joi.string().required().allow(''),
    username: Joi.string().required().allow(''),
    team_id: Joi.string().required().allow(''),
  }),
  channel: Joi.object({
    id: Joi.string().required().allow(''),
    name: Joi.string().required().allow(''),
  }),
  team: Joi.object({
    id: Joi.string().required().allow(''),
    domain: Joi.string().required().allow(''),
  }),
  container: Joi.object({
    type: Joi.string().required().allow(''),
    message_ts: Joi.string().required().allow(''),
    channel_id: Joi.string().required().allow(''),
    is_ephemeral: Joi.boolean().required().allow(''),
  }),
  actions: Joi.array().required(),
});
