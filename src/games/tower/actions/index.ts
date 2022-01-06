import { isNaN } from 'lodash';
import { logger } from '../../../config';
import { User } from '../../../models';
import { getUserBySlackId } from '../../../models/User';
import { gameResponseToSlackHandler } from '../../../modules/slack/utils';
import { parseEscapedSlackId } from '../../../utils/slack';
import { SAD_PARROT, SPINNER_EMOJI } from '../../consts/emojis';
import { TEN, ZERO } from '../../consts/global';

import { randomSkinColor } from '../../helpers';
import type {
  SlackBlockKitButtonElement,
  SlackBlockKitSelectMenuElement,
} from '../../model/SlackBlockKit';
import { SlackBlockKitPayload } from '../../model/SlackBlockKitPayload';
import { getEphemeralText, getGameError, getGameResponse, slackRequest } from '../../utils';
import { TOWER_SECONDARY_SLACK_ACTIONS, TOWER_SLACK_COMMANDS } from '../consts';
import { TowerEngine } from '../repositories/tower/engine';
import { TowerRepository } from '../repositories/tower/tower';
import {
  isTowerConfigAction,
  isTowerRaiderWithParamsAction,
  theTowerNotifyEphemeral,
} from '../utils';
import { towerConfigActionHandler } from './towerConfig';

const theTower = new TowerRepository(TowerEngine.getInstance());

export const actionReply = {
  // GENERAL
  somethingWentWrong:
    `:bloboohcry: Something went *wrong* \n` +
    `:man-shrugging:${randomSkinColor()} ` +
    `${randomSkinColor()}`,
  userNotFound: (userSlackId: string) =>
    `${SAD_PARROT} User with slack ID: <@${userSlackId}> not found`,
  // ADMIN
  adminNeedsToPickEnemy:
    `:bloboohcry: Something went *wrong* \n` +
    `:man-shrugging:${randomSkinColor()} ` +
    `It seems you don't pick an enemy for the floor :woman-shrugging:${randomSkinColor()}`,
  adminNeedsToPickEnemyAmount:
    `:bloboohcry: Something went *wrong* \n` +
    `:man-shrugging:${randomSkinColor()} ` +
    `It seems you don't pick an enemy *amount* for the floor :woman-shrugging:${randomSkinColor()}`,
  // RAIDER
  raiderNeedsToPickWeapon:
    `:bloboohcry: Something went *wrong* \n` +
    `:man-shrugging:${randomSkinColor()} ` +
    `It seems you don't have this weapon in your inventory :woman-shrugging:${randomSkinColor()}`,
  raiderNeedsToPickPerk:
    `:bloboohcry: Something went *wrong* \n` +
    `:man-shrugging:${randomSkinColor()} ` +
    `It seems you didn't pick an available perk :woman-shrugging:${randomSkinColor()}`,
  raiderNeedsToPickItem:
    `:bloboohcry: Something went *wrong* \n` +
    `:man-shrugging:${randomSkinColor()} ` +
    `It seems you didn't pick an available item, armor, or weapon :woman-shrugging:${randomSkinColor()}`,
  raiderNeedsToPickEnemyTarget:
    `:hand:${randomSkinColor()} You need to pick an enemy \n` +
    `*HINT:* Pick the one you hate the most :wink:`,
  raiderNeedsToPickRaiderTarget: `:hand:${randomSkinColor()} You need to pick a User \n`,
};

function towerPlayerSwitchActions(action: string, selectedId: number, userRequesting: User) {
  switch (action) {
    // // RAIDER
    case TOWER_SLACK_COMMANDS.PROGRESS_BUTTON:
      return theTower.displayProgress(userRequesting);
    case TOWER_SLACK_COMMANDS.ACTIONS_FROM_QUESTION:
      return theTower.raiderActions(userRequesting);
    case TOWER_SLACK_COMMANDS.RE_ENTER_BUTTON:
      return theTower.enterTheTower(userRequesting);
    case TOWER_SLACK_COMMANDS.HIDE:
      return theTower.hide(userRequesting);
    case TOWER_SLACK_COMMANDS.SEARCH_HEALTH:
      return theTower.searchForHealthkits(userRequesting);
    case TOWER_SLACK_COMMANDS.SEARCH_WEAPONS:
      return theTower.searchForWeapons(userRequesting);
    case TOWER_SLACK_COMMANDS.SEARCH_ARMOR:
      return theTower.searchForArmors(userRequesting);
    case TOWER_SLACK_COMMANDS.HEAL_OR_REVIVE_OTHER:
      return theTower.reviveOther(userRequesting);
    case TOWER_SLACK_COMMANDS.HEAL_OR_REVIVE_SELF:
      return theTower.reviveSelf(userRequesting);
    case TOWER_SECONDARY_SLACK_ACTIONS.HEAL_OR_REVIVE_CHOOSE_TARGET:
      return theTower.completeRevive(userRequesting, selectedId);
    case TOWER_SLACK_COMMANDS.HUNT:
      return theTower.hunt(userRequesting);
    case TOWER_SECONDARY_SLACK_ACTIONS.HUNT_CHOOSE_WEAPON:
      return theTower.chooseWeapon(userRequesting, selectedId);
    case TOWER_SECONDARY_SLACK_ACTIONS.HUNT_CHOOSE_TARGET:
      return theTower.chooseTarget(userRequesting, selectedId);
    case TOWER_SLACK_COMMANDS.REPEAT_LAST_ACTION:
      return theTower.repeatLastAction(userRequesting);
    case TOWER_SLACK_COMMANDS.START_ROUND_FROM_QUESTION:
      theTower
        .startRoundCommand(userRequesting)
        .then(async (reply) => {
          const slackResponseBody = gameResponseToSlackHandler(reply);
          await theTowerNotifyEphemeral(
            slackResponseBody.text ?? 'Something went wrong',
            userRequesting.slackId!,
            userRequesting.slackId!
          );
        })
        .catch(async (e) => {
          logger.error('Error in Slack Command: The Tower');
          logger.error(e);
          await theTowerNotifyEphemeral(
            'Something went wrong',
            userRequesting.slackId!,
            userRequesting.slackId!
          );
        });
      return Promise.resolve(getGameResponse(`Starting Round ${SPINNER_EMOJI}`));
    // ADMIN
    case TOWER_SECONDARY_SLACK_ACTIONS.CONFIRM_END_GAME:
      return theTower.endGame(userRequesting);
    case TOWER_SECONDARY_SLACK_ACTIONS.CANCEL_END_GAME:
      return theTower.cancelEndGame(userRequesting);
    default:
      return Promise.resolve(getGameError('Please provide a valid The Tower action'));
  }
}

export const handleTowerBlockAction = async (payload: SlackBlockKitPayload) => {
  const {
    response_url,
    user: { id: userSlackId },
    trigger_id,
    actions: [actionSelected],
  } = payload;
  const { action_id /*value*/ } = actionSelected as SlackBlockKitButtonElement;
  const userRequesting = await getUserBySlackId(userSlackId);
  if (!userRequesting) {
    return getGameError(actionReply.userNotFound(userSlackId));
  }
  const isConfigAction = isTowerConfigAction(action_id);
  const isRaiderWithParamsAction = isTowerRaiderWithParamsAction(action_id);
  if (isConfigAction || isRaiderWithParamsAction) {
    towerConfigActionHandler(userRequesting, {
      actionId: action_id,
      triggerId: trigger_id,
      responseUrl: response_url,
      actionSelected: actionSelected as SlackBlockKitSelectMenuElement,
    });
  } else {
    let mutableSelectedId = 0;
    const { selected_option: selectedGameOption } =
      actionSelected as SlackBlockKitSelectMenuElement;
    switch (action_id) {
      case TOWER_SECONDARY_SLACK_ACTIONS.HUNT_CHOOSE_WEAPON:
        if (!selectedGameOption?.value) {
          const replyErrorBody = getEphemeralText(actionReply.raiderNeedsToPickWeapon);
          return slackRequest(response_url, replyErrorBody).catch((error) => {
            logger.error('Error in Slack Action: The Tower');
            logger.error(error);
            return getGameError(actionReply.raiderNeedsToPickWeapon);
          });
        }
        mutableSelectedId = parseInt(selectedGameOption.value, TEN);
        break;
      case TOWER_SECONDARY_SLACK_ACTIONS.HUNT_CHOOSE_TARGET:
        if (!selectedGameOption?.value) {
          const replyErrorBody = getEphemeralText(actionReply.raiderNeedsToPickEnemyTarget);
          return slackRequest(response_url, replyErrorBody).catch((error) => {
            logger.error('Error in Slack Action: The Tower');
            logger.error(error);
            return getGameError(actionReply.raiderNeedsToPickEnemyTarget);
          });
        }
        const targetEnemyId = parseInt(selectedGameOption.value, TEN);
        mutableSelectedId = !isNaN(targetEnemyId) ? targetEnemyId : ZERO;
        break;
      case TOWER_SECONDARY_SLACK_ACTIONS.HEAL_OR_REVIVE_CHOOSE_TARGET:
        if (!selectedGameOption?.value) {
          const replyErrorBody = getEphemeralText(actionReply.raiderNeedsToPickRaiderTarget);
          return slackRequest(response_url, replyErrorBody).catch((error) => {
            logger.error('Error in Slack Action: The Tower');
            logger.error(error);
            return getGameError(actionReply.raiderNeedsToPickRaiderTarget);
          });
        }
        const targetId = parseEscapedSlackId(selectedGameOption.value);
        const targetUser = await getUserBySlackId(targetId);
        if (!targetUser) {
          return getGameError(actionReply.userNotFound(targetId));
        }
        mutableSelectedId = targetUser.id;
        break;
    }

    towerPlayerSwitchActions(action_id, mutableSelectedId, userRequesting)
      .then((gameActionResponse) => {
        const replyToPlayerBody = gameResponseToSlackHandler(gameActionResponse);
        return slackRequest(response_url, replyToPlayerBody);
      })
      .catch((error) => {
        logger.error('Error in Slack Action: The Tower');
        logger.error(error);
        return getGameError(actionReply.somethingWentWrong);
      });
  }
  return {};
};
