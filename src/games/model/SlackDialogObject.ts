import Joi from 'joi';

import type {
  SlackBlockKitCompositionOption,
  SlackBlockKitCompositionTextOnly,
  SlackBlockKitLayoutElement,
} from './SlackBlockKit';

export interface SlackDialog {
  type: 'home' | 'modal';
  title: SlackBlockKitCompositionTextOnly;
  blocks: SlackBlockKitLayoutElement[];
  close?: SlackBlockKitCompositionTextOnly;
  submit?: SlackBlockKitCompositionTextOnly;
  private_metadata?: string;
  callback_id?: string;
  clear_on_close?: boolean;
  notify_on_close?: boolean;
  external_id?: string;
}

export interface WeaponData {
  create_or_update_weapon_data_name: {
    create_or_update_weapon_data_name_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_weapon_data_emoji: {
    create_or_update_weapon_data_emoji_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_weapon_data_mindamage: {
    create_or_update_weapon_data_mindamage_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_weapon_data_maxdamage: {
    create_or_update_weapon_data_maxdamage_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_weapon_data_usage_limit: {
    create_or_update_weapon_data_usage_limit_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_weapon_data_is_archived: {
    create_or_update_weapon_data_is_archived_action: {
      type: string;
      selected_option: SlackBlockKitCompositionOption;
    };
  };
  create_or_update_weapon_data_rarity: {
    create_or_update_weapon_data_rarity_action: {
      type: string;
      selected_option: {
        text: {
          type: string;
          text: string;
        };
        value: string;
      };
    };
  };
  create_or_update_weapon_data_traits: {
    create_or_update_weapon_data_traits_action: {
      selected_options: {
        text: {
          type: string;
          text: string;
        };
        value: string;
      }[];
    };
  };
}

export interface CampaignStoreItemsSelection {
  modal_data_go_into_campaign_store_select_loot_crate: {
    purchase_loot_crate: {
      selected_option: SlackBlockKitCompositionOption;
    };
  };
}

export interface LootCrateData {
  create_or_update_loot_crate_data_name: {
    create_or_update_loot_crate_data_name_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_loot_crate_data_size: {
    create_or_update_loot_crate_data_size_action: {
      type: string;
      selected_option: SlackBlockKitCompositionOption;
    };
  };
  create_or_update_loot_crate_data_rarity: {
    create_or_update_loot_crate_data_rarity_action: {
      type: string;
      selected_option: SlackBlockKitCompositionOption;
    };
  };
  create_or_update_loot_crate_data_active: {
    create_or_update_loot_crate_data_active_action: {
      type: string;
      selected_option: SlackBlockKitCompositionOption;
    };
  };
}

export interface ZoneData {
  ['create-or-update-zone-data-name']: {
    ['create-or-update-zone-data-name-action']: {
      type: string;
      value: string;
    };
  };
  ['create-or-update-zone-data-emoji']: {
    ['create-or-update-zone-data-emoji-action']: {
      type: string;
      value: string;
    };
  };
  ['create-or-update-zone-data-code']: {
    ['create-or-update-zone-data-code-action']: {
      type: string;
      selected_option: SlackBlockKitCompositionOption;
    };
  };
  ['create-or-update-zone-data-is-archived']: {
    ['create-or-update-zone-data-is-archived-action']: {
      type: string;
      selected_option: SlackBlockKitCompositionOption;
    };
  };
}
export interface EnemyData {
  create_or_update_enemy_data_name: {
    create_or_update_enemy_data_name_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_emoji: {
    create_or_update_enemy_data_emoji_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_gifUrl: {
    create_or_update_enemy_data_gifUrl_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_minorDamageRate: {
    create_or_update_enemy_data_minorDamageRate_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_majorDamageRate: {
    create_or_update_enemy_data_majorDamageRate_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_health: {
    create_or_update_enemy_data_health_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_pattern: {
    create_or_update_enemy_data_pattern_action: {
      type: string;
      selected_option: SlackBlockKitCompositionOption;
    };
  };
  create_or_update_enemy_data_isBoss: {
    create_or_update_enemy_data_isBoss_action: {
      type: string;
      selected_option: SlackBlockKitCompositionOption;
    };
  };
  create_or_update_enemy_data_traits: {
    create_or_update_enemy_data_traits_action: {
      selected_options: {
        text: {
          type: string;
          text: string;
        };
        value: string;
      }[];
    };
  };
  create_or_update_enemy_data_abilitiesJSON_accuracy: {
    create_or_update_enemy_data_abilitiesJSON_accuracy_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_abilitiesJSON_attack_rate: {
    create_or_update_enemy_data_abilitiesJSON_attack_rate_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_abilitiesJSON_defense_rate: {
    create_or_update_enemy_data_abilitiesJSON_defense_rate_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_abilitiesJSON_stun_block_rate: {
    create_or_update_enemy_data_abilitiesJSON_stun_block_rate_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_abilitiesJSON_evade_rate: {
    create_or_update_enemy_data_abilitiesJSON_evade_rate_action: {
      type: string;
      value: string;
    };
  };
  create_or_update_enemy_data_abilitiesJSON_initiative: {
    create_or_update_enemy_data_abilitiesJSON_initiative_action: {
      type: string;
      value: string;
    };
  };
}

export interface TowerFormData {
  [`tower-update-name-block`]: {
    [`tower-update-name-action`]: {
      type: string;
      value: string;
    };
  };
  [`tower-update-luna-prize-block`]: {
    [`tower-update-luna-prize-action`]: {
      type: string;
      value: string;
    };
  };
  [`tower-update-coin-prize-block`]: {
    [`tower-update-coin-prize-action`]: {
      type: string;
      value: string;
    };
  };
}

export interface SLackDialogSubmission extends SlackDialog {
  id: string;
  team_id: string;
  state: {
    values:
      | CampaignStoreItemsSelection
      | LootCrateData
      | EnemyData
      | TowerFormData
      | WeaponData
      | ZoneData
      | { [key: string]: object };
  };
  hash: string;
  previous_view_id?: string;
  root_view_id?: string;
  app_id?: string;
  app_installed_team_id?: string;
  bot_id?: string;
}

export interface SlackDialogSubmissionPayload {
  type: 'view_submission';
  team: {
    id: string;
    domain: string;
  };
  user: {
    id: string;
    name?: string;
    username: string;
    team_id: string;
  };
  api_app_id: string;
  token: string;
  trigger_id: string;
  view: SLackDialogSubmission;
  response_urls?: string[];
}

export const slackSSDialogSubmissionPayloadSchema = Joi.object({
  type: Joi.string().required().allow(''),
  team: Joi.object({
    id: Joi.string().required().allow(''),
    domain: Joi.string().required().allow(''),
  }),
  user: Joi.object({
    id: Joi.string().required().allow(''),
    name: Joi.string().optional().allow(''),
    username: Joi.string().required().allow(''),
    team_id: Joi.string().required().allow(''),
  }),
  api_app_id: Joi.string().required().allow(''),
  token: Joi.string().required().allow(''),
  trigger_id: Joi.string().required().allow(''),
  view: Joi.object({
    type: Joi.string().valid('home', 'modal').required(),
    title: Joi.object().required().allow(null),
    blocks: Joi.array().required().allow(null),
    close: Joi.object().optional().allow(null),
    submit: Joi.object().optional().allow(null),
    private_metadata: Joi.string().optional().allow(''),
    callback_id: Joi.string().optional().allow(''),
    clear_on_close: Joi.boolean().optional().allow(null),
    notify_on_close: Joi.boolean().optional().allow(null),
    external_id: Joi.string().optional().allow(''),
    id: Joi.string().required().allow(''),
    team_id: Joi.string().required().allow(''),
    state: Joi.object({
      values: Joi.object().allow(null),
    }),
    hash: Joi.string().required().allow(''),
    previous_view_id: Joi.string().optional().allow('', null),
    root_view_id: Joi.string().optional().allow(''),
    app_id: Joi.string().optional().allow(''),
    app_installed_team_id: Joi.string().optional().allow(''),
    bot_id: Joi.string().optional().allow(''),
  }),
  response_urls: Joi.array().items(Joi.string()).optional(),
});
