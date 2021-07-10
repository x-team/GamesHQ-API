import Joi from 'joi';
import { SlackUser } from './SlackUser';

export interface SlackEventUserChange {
  type: 'user_change';
  user: SlackUser;
}

export interface SlackEventMemberLeftChannel {
  type: 'member_left_channel';
  user: string;
  channel: string;
  channel_type: string;
  team: string;
  event_ts: string;
}

export const slackEventMemberLeftChannelSchema = Joi.object({
  type: Joi.string().valid('member_left_channel'),
  user: Joi.string().required().allow(''),
  channel: Joi.string().required().allow(''),
  channel_type: Joi.string().allow(''),
  team: Joi.string().allow(''),
  event_ts: Joi.string().allow(''),
});

export interface SlackEventGroupArchive {
  type: 'message';
  subtype: 'group_archive';
  ts: string;
  user: string;
  text: string;
  channel: string;
  channel_type: string;
  team: string;
  event_ts: string;
}

export const slackEventGroupArchiveSchema = Joi.object({
  type: Joi.string().valid('message'),
  subtype: Joi.string().valid('group_archive'),
  ts: Joi.string().allow(''),
  user: Joi.string().required().allow(''),
  text: Joi.string().allow(''),
  channel: Joi.string().required().allow(''),
  channel_type: Joi.string().allow(''),
  team: Joi.string().allow(''),
  event_ts: Joi.string().allow(''),
});

interface SlackMessageEdited {
  user?: string;
  ts: string;
}

interface SlackMessageChanged {
  client_msg_id?: string;
  type: 'message';
  user?: string;
  team?: string;
  text: string;
  ts: string;
  edited?: SlackMessageEdited;
  blocks: SlackGeneralEventMessage[];
  source_team?: string;
  user_team?: string;
}

export interface SlackEventMessage {
  type: 'message';
  subtype?: string;
  channel: string;
  user?: string;
  text: string;
  ts: string;
  event_ts: string;
  channel_type: string;
}

export interface SlackEventMessageChanged {
  type: 'message';
  subtype: 'message_changed';
  hidden: boolean;
  channel: string;
  ts: string;
  event_ts: string;
  channel_type: string;
  message: SlackMessageChanged;
  previous_message: SlackGeneralEventMessage;
}

export interface SlackGeneralEventMessage {
  [k: string]: string;
}

export interface SlackEventReactionAdded {
  type: 'reaction_added';
  user: string;
  reaction: string;
  item_user: string;
  item: {
    type: string;
    channel: string;
    ts: string;
  };
  event_ts: string;
}

export interface SlackEventLinkShared {
  type: 'link_shared';
  channel: string;
  is_bot_user_member: boolean;
  user: string;
  message_ts: string;
  thread_ts: string;
  links: Array<{ domain: string; url: string }>;
  event_ts: string;
}

export interface SlackEventsPayload {
  event:
    | SlackEventUserChange
    | SlackEventReactionAdded
    | SlackEventMessage
    | SlackEventMessageChanged
    | SlackEventLinkShared
    | SlackGeneralEventMessage
    | SlackEventMemberLeftChannel;
  type: string;
  challenge?: string;
  token: string;
  team_id: string;
  api_app_id: string;
  event_id: string;
  event_time: number;
}

export const slackEventUserChangeSchema = Joi.object({
  type: Joi.string().required().valid('user_change'),
  user: Joi.object({
    id: Joi.string(),
    profile: Joi.object({
      image_192: Joi.string().required(),
    }).required(),
  }).required(),
});

export const slackEventReactionAddedSchema = Joi.object({
  type: Joi.string().required().valid('reaction_added'),
  user: Joi.string().required().allow(''),
  reaction: Joi.string().allow(''),
  item_user: Joi.string().allow(''),
  item: Joi.object({
    type: Joi.string().required().allow(''),
    channel: Joi.string().required().allow(''),
    ts: Joi.string().required().allow(''),
  }),
});

export const slackGeneralEventMessageSchema = Joi.object({});

const slackEventMessageSchema = Joi.object({
  type: Joi.string().required().valid('message'),
  user: Joi.string().required().allow(''),
  channel: Joi.string().allow(''),
  text: Joi.string().allow(''),
  ts: Joi.string().required().allow(''),
  channel_type: Joi.string().allow(''),
  event_ts: Joi.string().allow(''),
});

const slackEventLinkSharedSchema = Joi.object({
  type: Joi.string().required().valid('link_shared'),
  channel: Joi.string().required().allow(''),
  is_bot_user_member: Joi.boolean().required(),
  user: Joi.string().required().allow(''),
  message_ts: Joi.string().required().allow(''),
  thread_ts: Joi.string().optional().allow(null),
  links: Joi.array()
    .items(
      Joi.object({
        domain: Joi.string().required().allow(''),
        url: Joi.string().required().allow(''),
      }).optional()
    )
    .required(),
  event_ts: Joi.string().required().allow(''),
});

const slackEventMessageChangedSchema = Joi.object({
  type: Joi.string().required().valid('message'),
  subtype: Joi.string().required().valid('message_changed'),
  hidden: Joi.boolean().required(),
  message: Joi.object({
    type: Joi.string().required().valid('message'),
    user: Joi.string().required().allow(''),
    client_msg_id: Joi.string().allow(''),
    text: Joi.string().allow(''),
    ts: Joi.string().required().allow(''),
    team: Joi.string().allow(''),
    source_team: Joi.string().allow(''),
    user_team: Joi.string().allow(''),
    blocks: Joi.array(),
    edited: Joi.object({
      ts: Joi.string().required().allow(''),
      user: Joi.string().required().allow(''),
    }),
  }),
  channel: Joi.string().allow(''),
  previous_message: Joi.object({}),
  ts: Joi.string().required().allow(''),
  channel_type: Joi.string().allow(''),
  event_ts: Joi.string().allow(''),
});

export const slackEventsPayloadSchema = Joi.object({
  token: Joi.string().required().allow(''),
  team_id: Joi.string().required().allow(''),
  api_app_id: Joi.string().required().allow(''),
  type: Joi.string().required().allow(''),
  event_id: Joi.string().required().allow(''),
  event_time: Joi.number().required().allow(null),
  event: [
    slackEventMemberLeftChannelSchema,
    slackEventGroupArchiveSchema,
    slackEventUserChangeSchema,
    slackEventReactionAddedSchema,
    slackEventMessageSchema,
    slackEventMessageChangedSchema,
    slackEventLinkSharedSchema,
    slackGeneralEventMessageSchema,
  ],
});
