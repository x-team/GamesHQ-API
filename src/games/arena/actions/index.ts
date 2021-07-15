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
import { getEphemeralText, getGameError, slackRequest } from '../../utils';
import { ARENA_SECONDARY_ACTIONS } from '../consts';
import { ArenaRepository } from '../repositories/arena/arena';
import { ArenaEngine } from '../repositories/arena/engine';

const gameEngine = ArenaEngine.getInstance();
const arena = new ArenaRepository(gameEngine);

const actionReply = {
  // GENERAL
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
};

function arenaPlayerSwitchActions(action: string, args: number | number[], userRequesting: User) {
  const singleArg = typeof args === 'number' ? args : args[0];
  const arrayArgs = typeof args === 'number' ? [args] : args;
  logger.info({ singleArg, arrayArgs });
  switch (action) {
    // PLAYER
    // case ARENA_SLACK_COMMANDS.STATUS:
    //   return arena.status(userRequesting);
    // case ARENA_SLACK_COMMANDS.HIDE:
    //   return arena.hide(userRequesting);
    // case ARENA_SLACK_COMMANDS.SEARCH_HEALTH:
    //   return arena.searchForHealth(userRequesting);
    // case ARENA_SLACK_COMMANDS.SEARCH_WEAPONS:
    //   return arena.searchForWeapons(userRequesting);
    // case ARENA_SLACK_COMMANDS.SEARCH_ARMOR:
    //   return arena.searchForArmors(userRequesting);
    // case ARENA_SLACK_COMMANDS.HEAL_OR_REVIVE_OTHER:
    //   return arena.reviveOther(userRequesting);
    // case ARENA_SLACK_COMMANDS.HEAL_OR_REVIVE_SELF:
    //   return arena.reviveSelf(userRequesting);
    // case ARENA_SLACK_COMMANDS.HUNT:
    //   return arena.hunt(userRequesting);
    // case ARENA_SLACK_COMMANDS.CHEER:
    //   return arena.cheer(userRequesting);
    // case ARENA_SLACK_COMMANDS.REPEAT_LAST_CHEER:
    //   return arena.repeatLastCheer(userRequesting);
    // case ARENA_SLACK_COMMANDS.CHANGE_LOCATION:
    //   return arena.bossChangeLocation(userRequesting);
    // case ARENA_SECONDARY_ACTIONS.CHANGE_LOCATION:
    //   return arena.changeLocation(userRequesting, singleArg);
    // case ARENA_SECONDARY_ACTIONS.HUNT_CHOOSE_WEAPON:
    //   return arena.chooseWeapon(userRequesting, singleArg, ARENA_ACTIONS.HUNT);
    // case ARENA_SECONDARY_ACTIONS.CHEER_CHOOSE_TARGET:
    //   return arena.completeCheer(userRequesting, singleArg);
    // case ARENA_SECONDARY_ACTIONS.HEAL_OR_REVIVE_CHOOSE_TARGET:
    //   return arena.completeRevive(userRequesting, singleArg);
    // case ARENA_SECONDARY_ACTIONS.HUNT_CHOOSE_TARGET:
    //   return arena.chooseTarget(userRequesting, singleArg);
    // ADMIN
    case ARENA_SECONDARY_ACTIONS.CONFIRM_END_GAME:
      return arena.endGame(userRequesting);
    case ARENA_SECONDARY_ACTIONS.CANCEL_END_GAME:
      return arena.cancelEndGame(userRequesting);
    case ARENA_SECONDARY_ACTIONS.CONFIRM_GIVE_EVERYONE_WEAPONS:
      return arena.giveEveryoneWeapon(userRequesting, singleArg);
    // case ARENA_SECONDARY_ACTIONS.CONFIRM_NARROW_WEAPONS:
    //   return arena.confirmNarrowWeapons(userRequesting, arrayArgs);
    // case ARENA_SECONDARY_ACTIONS.CONFIRM_NARROW_ZONES:
    //   return arena.confirmNarrowZones(userRequesting, arrayArgs);
    default:
      return getGameError('Please provide a valid The Arena command');
  }
}

export const handleViewSubmissionAction = async (_payload: SlackBlockKitPayload) => {
  // const {
  // user: { id: userSlackId },
  // view: {
  //   state: { values },
  //   callback_id,
  // },
  // } = payload;

  // const userRequesting = await getUserBySlackId(userSlackId);
  // if (!userRequesting) {
  //   return getGameError(actionReply.userNotFound(userSlackId));
  // }
  // const zoneRepository = ZoneRepository.getInstance();

  // switch (callback_id) {
  //   case ARENA_SECONDARY_ACTIONS.CREATE_OR_UPDATE_ZONE_DATA:
  //     zoneRepository
  //       .createOrUpdateZoneForm(mutableUserRequesting, values as ZoneData)
  //       .catch((error) => handleException({ error, plugin: 'slack' }));
  //     break;
  // }

  return {};
};

export const handleArenaAction = async (
  payload: SlackBlockKitPayload
): Promise<Lifecycle.ReturnValue> => {
  const {
    type,
    response_url,
    user: { id: userSlackId },
    actions: [action],
    // trigger_id,
  } = payload;
  const { action_id /*value*/ } = action as SlackBlockKitButtonElement;
  const userRequesting = await getUserBySlackId(userSlackId);
  if (!userRequesting) {
    return getGameError(actionReply.userNotFound(userSlackId));
  }
  // const zoneRepository = ZoneRepository.getInstance();

  // const [actionId, zoneId] = value?.split('_') ?? [];
  // switch (actionId) {
  //   case 'editzone':
  //     return zoneRepository.openZoneModal(trigger_id, zoneId);
  //     break;
  //   case 'deletezone':
  //     await zoneRepository.deleteZone(mutableUserRequesting, zoneId);
  //     break;
  // }
  switch (type) {
    case 'block_actions':
      let mutableSelectedId: number | number[] = 0;
      const { selected_option, selected_options } = action as SlackBlockKitSelectMenuElement;
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
      const gameActionResponse = await arenaPlayerSwitchActions(
        action_id,
        mutableSelectedId,
        userRequesting
      );

      const replyToPlayerBody = gameResponseToSlackHandler(gameActionResponse);
      return slackRequest(response_url, replyToPlayerBody).catch((error) => {
        logger.error('Error in Slack Action: The Arena');
        logger.error(error);
        return getGameError(actionReply.somethingWentWrong);
      });
    default:
      // We need to respond to Slack within 3000ms or the action will fail.
      // So we need this line
      return {};
  }
};
