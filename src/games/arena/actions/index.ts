import type { Lifecycle } from '@hapi/hapi';

import { logger } from '../../../config';
import type { User } from '../../../models';
import { getUserBySlackId } from '../../../models/User';
import { gameResponseToSlackHandler } from '../../../modules/slack/utils';
import { parseEscapedSlackId } from '../../../utils/slack';
import { SAD_PARROT } from '../../consts/emojis';
import { randomSkinColor } from '../../helpers';
import type {
  SlackBlockKitButtonElement,
  SlackBlockKitSelectMenuElement,
} from '../../model/SlackBlockKit';
import type { SlackBlockKitPayload } from '../../model/SlackBlockKitPayload';
import { ZoneData } from '../../model/SlackDialogObject';
import { extractSecondaryAction, getEphemeralText, getGameError, slackRequest } from '../../utils';
import { ARENA_ACTIONS, ARENA_SECONDARY_ACTIONS, ARENA_SLACK_COMMANDS } from '../consts';
import { ArenaRepository } from '../repositories/arena/arena';
import { ArenaEngine } from '../repositories/arena/engine';
import { ZoneRepository } from '../repositories/zones/zone';
import { arenaNotifyEphemeral, isArenaConfigAction } from '../utils';

const gameEngine = ArenaEngine.getInstance();
const arenaRepository = new ArenaRepository(gameEngine);
const zoneRepository = ZoneRepository.getInstance();

const actionReply = {
  // GENERAL
  needToSelectSomething: `Please select an option to continue`,
  somethingWentWrong:
    `:bloboohcry: Something went *wrong* \n` +
    `:man-shrugging:${randomSkinColor()} ` +
    `${randomSkinColor()}`,
  // USERS
  userNotFound: (slackId: string) => `${SAD_PARROT} User with slack ID: <@${slackId}> not found`,
  // PLAYERS
  playerNeedsToPickWeapon:
    `:bloboohcry: Something went *wrong* \n` +
    `:man-shrugging:${randomSkinColor()} ` +
    `It seems you don't have this weapon in your inventory :woman-shrugging:${randomSkinColor()}`,
  playerNeedsToPickTarget:
    `:hand:${randomSkinColor()} You need to pick a user \n` +
    `*HINT:* At least try to pick yourself :wink:`,
  needToSelectWeaponsToNarrow: `At least one weapon needs to be selected.`,
  needToSelectZonesToNarrow: `At least one zone needs to be selected.`,
  needToSelectZoneToDelete: `Please select a valid zone to delete`,
};

function arenaPlayerSwitchActions(action: string, args: number | number[], userRequesting: User) {
  const singleArg = typeof args === 'number' ? args : args[0];
  const arrayArgs = typeof args === 'number' ? [args] : args;
  logger.debug({ singleArg, arrayArgs });
  switch (action) {
    // PLAYER
    case ARENA_SLACK_COMMANDS.STATUS:
      return arenaRepository.status(userRequesting);
    case ARENA_SLACK_COMMANDS.SEARCH_HEALTH:
      return arenaRepository.searchForHealth(userRequesting);
    case ARENA_SLACK_COMMANDS.SEARCH_WEAPONS:
      return arenaRepository.searchForWeapons(userRequesting);
    case ARENA_SLACK_COMMANDS.SEARCH_ARMOR:
      return arenaRepository.searchForArmors(userRequesting);
    case ARENA_SLACK_COMMANDS.HIDE:
      return arenaRepository.hide(userRequesting);
    case ARENA_SLACK_COMMANDS.HEAL_OR_REVIVE_OTHER:
      return arenaRepository.reviveOther(userRequesting);
    case ARENA_SLACK_COMMANDS.HEAL_OR_REVIVE_SELF:
      return arenaRepository.reviveSelf(userRequesting);
    case ARENA_SLACK_COMMANDS.HUNT:
      return arenaRepository.hunt(userRequesting);
    // case ARENA_SLACK_COMMANDS.CHEER:
    //   return arenaRepository.cheer(userRequesting);
    // case ARENA_SLACK_COMMANDS.REPEAT_LAST_CHEER:
    //   return arenaRepository.repeatLastCheer(userRequesting);
    case ARENA_SECONDARY_ACTIONS.CHANGE_LOCATION:
      return arenaRepository.changeLocation(userRequesting, singleArg);
    case ARENA_SLACK_COMMANDS.CHANGE_LOCATION:
      return arenaRepository.bossChangeLocation(userRequesting);
    case ARENA_SECONDARY_ACTIONS.HUNT_CHOOSE_WEAPON:
      return arenaRepository.chooseWeapon(userRequesting, singleArg, ARENA_ACTIONS.HUNT);
    // case ARENA_SECONDARY_ACTIONS.CHEER_CHOOSE_TARGET:
    //   return arenaRepository.completeCheer(userRequesting, singleArg);
    case ARENA_SECONDARY_ACTIONS.HEAL_OR_REVIVE_CHOOSE_TARGET:
      return arenaRepository.completeRevive(userRequesting, singleArg);
    case ARENA_SECONDARY_ACTIONS.HUNT_CHOOSE_TARGET:
      return arenaRepository.chooseTarget(userRequesting, singleArg);
    // ADMIN
    case ARENA_SECONDARY_ACTIONS.CONFIRM_END_GAME:
      return arenaRepository.endGame(userRequesting);
    case ARENA_SECONDARY_ACTIONS.CANCEL_END_GAME:
      return arenaRepository.cancelEndGame(userRequesting);
    case ARENA_SECONDARY_ACTIONS.CONFIRM_GIVE_EVERYONE_WEAPONS:
      return arenaRepository.giveEveryoneWeapon(userRequesting, singleArg);
    case ARENA_SECONDARY_ACTIONS.CONFIRM_NARROW_WEAPONS:
      return arenaRepository.confirmNarrowWeapons(userRequesting, arrayArgs);
    case ARENA_SECONDARY_ACTIONS.CONFIRM_NARROW_ZONES:
      return zoneRepository.confirmNarrowZones(userRequesting, arrayArgs);
    default:
      return Promise.resolve(getGameError('Please provide a valid The Arena command'));
  }
}

export const handleViewSubmissionAction = async (payload: SlackBlockKitPayload) => {
  const {
    user: { id: userSlackId },
    view: {
      state: { values },
      callback_id,
    },
  } = payload;

  const userRequesting = await getUserBySlackId(userSlackId);
  if (!userRequesting) {
    return getGameError(actionReply.userNotFound(userSlackId));
  }

  switch (callback_id) {
    case ARENA_SECONDARY_ACTIONS.CREATE_OR_UPDATE_ZONE_DATA:
      zoneRepository
        .createOrUpdateZoneForm(userRequesting, values as ZoneData)
        .then(async (response) => {
          if (response?.type === 'error') {
            await arenaNotifyEphemeral(
              response.text ?? 'Something went wrong',
              userRequesting.slackId!,
              userRequesting.slackId!
            );
          }
        });
  }
  return {};
};

export const handleArenaAction = async (
  payload: SlackBlockKitPayload
): Promise<Lifecycle.ReturnValue> => {
  const {
    type,
    response_url,
    user: { id: userSlackId },
    actions: [actionSelected],
    trigger_id,
  } = payload;
  const { action_id, value: actionSelectedValue } = actionSelected as SlackBlockKitButtonElement;
  const userRequesting = await getUserBySlackId(userSlackId);
  if (!userRequesting) {
    return getGameError(actionReply.userNotFound(userSlackId));
  }
  switch (type) {
    case 'block_actions':
      if (isArenaConfigAction(action_id)) {
        return handleConfigAction(userRequesting, trigger_id, actionSelectedValue);
      }
      let mutableSelectedId: number | number[] = 0;
      const { selected_option, selected_options } =
        actionSelected as SlackBlockKitSelectMenuElement;
      switch (action_id) {
        case ARENA_SECONDARY_ACTIONS.CHANGE_LOCATION:
        case ARENA_SECONDARY_ACTIONS.HUNT_CHOOSE_WEAPON:
        case ARENA_SECONDARY_ACTIONS.CONFIRM_GIVE_EVERYONE_WEAPONS:
          if (!selected_option?.value) {
            const replyErrorBody = getEphemeralText(actionReply.playerNeedsToPickWeapon);
            return slackRequest(response_url, replyErrorBody).catch((error) => {
              logger.error('Error in Slack Action: The Arena');
              logger.error(error);
              return getGameError(actionReply.playerNeedsToPickWeapon);
            });
          }
          mutableSelectedId = parseInt(selected_option.value, 10);
          break;
        case ARENA_SECONDARY_ACTIONS.CONFIRM_NARROW_WEAPONS:
          if (!selected_options || !selected_options.length) {
            const replyErrorBody = getEphemeralText(actionReply.needToSelectWeaponsToNarrow);
            return slackRequest(response_url, replyErrorBody).catch((error) => {
              logger.error('Error in Slack Action: The Arena');
              logger.error(error);
              return getGameError(actionReply.needToSelectWeaponsToNarrow);
            });
          }
          mutableSelectedId = selected_options.map((option) => parseInt(option.value));
          break;
        case ARENA_SECONDARY_ACTIONS.CONFIRM_NARROW_ZONES:
          if (!selected_options || !selected_options.length) {
            const replyErrorBody = getEphemeralText(actionReply.needToSelectZonesToNarrow);
            return slackRequest(response_url, replyErrorBody).catch((error) => {
              logger.error('Error in Slack Action: The Arena');
              logger.error(error);
              return getGameError(actionReply.needToSelectZonesToNarrow);
            });
          }
          mutableSelectedId = selected_options.map((option) => parseInt(option.value));
          break;
        case ARENA_SECONDARY_ACTIONS.HUNT_CHOOSE_TARGET:
        case ARENA_SECONDARY_ACTIONS.CHEER_CHOOSE_TARGET:
        case ARENA_SECONDARY_ACTIONS.HEAL_OR_REVIVE_CHOOSE_TARGET:
          if (!selected_option?.value) {
            const replyErrorBody = getEphemeralText(actionReply.playerNeedsToPickTarget);
            return slackRequest(response_url, replyErrorBody).catch((error) => {
              logger.error('Error in Slack Action: The Arena');
              logger.error(error);
              return getGameError(actionReply.playerNeedsToPickTarget);
            });
          }
          const targetId = parseEscapedSlackId(selected_option.value);
          const targetUser = await getUserBySlackId(targetId);
          if (!targetUser) {
            return getGameError(actionReply.userNotFound(userSlackId));
          }

          mutableSelectedId = targetUser.id;
          break;
      }
      arenaPlayerSwitchActions(action_id, mutableSelectedId, userRequesting)
        .then((gameActionResponse) => {
          const replyToPlayerBody = gameResponseToSlackHandler(gameActionResponse);
          return slackRequest(response_url, replyToPlayerBody);
        })
        .catch((error) => {
          logger.error('Error in Slack Action: The Arena');
          logger.error(error);
          return getGameError(actionReply.somethingWentWrong);
        });
      break;
    default:
      // We need to respond to Slack within 3000ms or the action will fail.
      // So we need this line
      return {};
  }
  // We need to respond to Slack within 3000ms or the action will fail.
  // So we need this line
  return {};
};

const handleConfigAction = async (
  userRequesting: User,
  triggerId: string,
  actionSelectedValue?: string
): Promise<Lifecycle.ReturnValue> => {
  if (!actionSelectedValue) {
    return getGameError(actionReply.needToSelectSomething);
  }
  const { action: actionParsed, selectedId } = extractSecondaryAction(actionSelectedValue);
  switch (actionParsed) {
    case ARENA_SECONDARY_ACTIONS.UPDATE_ZONE:
      return ZoneRepository.openZoneModal(triggerId, selectedId);
    case ARENA_SECONDARY_ACTIONS.DELETE_ZONE:
      if (!selectedId) {
        return getGameError(actionReply.needToSelectZoneToDelete);
      }
      zoneRepository.deleteZone(userRequesting, selectedId).then(async (response) => {
        if (response?.type === 'error') {
          await arenaNotifyEphemeral(
            response.text ?? 'Something went wrong',
            userRequesting.slackId!,
            userRequesting.slackId!
          );
        }
      });
      break;
    default:
      break;
  }
  // We need to respond to Slack within 3000ms or the action will fail.
  // So we need this line
  return {};
};
