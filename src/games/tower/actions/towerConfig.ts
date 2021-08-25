import { actionReply } from '.';
import { logger } from '../../../config';
import { User } from '../../../models';
import { gameResponseToSlackHandler } from '../../../modules/slack/utils';
import { TEN, ZERO } from '../../consts/global';
import { SlackBlockKitSelectMenuElement } from '../../model/SlackBlockKit';
import { extractSecondaryAction, getGameError, slackRequest } from '../../utils';
import { TOWER_SECONDARY_SLACK_ACTIONS } from '../consts';
import { TowerEngine } from '../repositories/tower/engine';
import { TowerRepository } from '../repositories/tower/tower';

const theTower = new TowerRepository(TowerEngine.getInstance());

interface ConfigActionParams {
  actionId: string;
  triggerId: string;
  responseUrl: string;
  actionSelected: SlackBlockKitSelectMenuElement;
}
export function towerConfigActionHandler(
  userRequesting: User,
  { actionId, triggerId, responseUrl, actionSelected }: ConfigActionParams
) {
  const { action: actionParsed, selectedId } = extractSecondaryAction(actionId);
  const itemPerkSelected = actionParsed.split('-').pop();
  const {
    /*selected_option*/
  } = actionSelected;
  // let mutableSelectedId = 0;
  // let mutableSelectedFloorId = 0;
  switch (actionParsed) {
    // ADMIN
    case TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_ID:
      const selectedTowerId = selectedId ? parseInt(selectedId, TEN) : ZERO;
      theTower
        .updateTowerBasicInfo(userRequesting, triggerId, selectedTowerId)
        .then((gameActionResponse) => {
          const replyToPlayerBody = gameResponseToSlackHandler(gameActionResponse);
          return slackRequest(responseUrl, replyToPlayerBody);
        })
        .catch((error) => {
          logger.error('Error in Slack Action: The Tower');
          logger.error(error);
          return getGameError(actionReply.somethingWentWrong);
        });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR:
      // const selectedFloorNumber = selectedId ? parseInt(selectedId, TEN) : ZERO;
      // if (!selected_option?.value) {
      //   const replyErrorBody = getEphemeralText(actionReply.adminNeedsToPickEnemy);
      //   return slackRequest(response_url, replyErrorBody).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      // }
      // mutableSelectedId = parseInt(selected_option.value, TEN);
      // theTower
      //   .addEnemyToTowerFloor(userRequesting, selectedFloorNumber, mutableSelectedId)
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_AMOUNT_TO_TOWER_FLOOR:
      // const selectedEnemyId = selectedId ? parseInt(selectedId, TEN) : ZERO;
      // if (!selected_option?.value) {
      //   const replyErrorBody = getEphemeralText(actionReply.adminNeedsToPickEnemy);
      //   return slackRequest(response_url, replyErrorBody).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      // }
      // theTower
      //   .addEnemyAmountToTowerFloor(userRequesting, selectedEnemyId, selected_option.value)
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.REMOVE_ENEMY_FROM_TOWER_FLOOR:
      // if (!selectedId) {
      //   const replyErrorBody = getEphemeralText(actionReply.adminNeedsToPickEnemy);
      //   return slackRequest(response_url, replyErrorBody).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      // }
      // const selectedTowerFloorEnemyId = parseInt(selectedId, TEN);
      // theTower
      //   .removeEnemyFromTowerFloor(userRequesting, selectedTowerFloorEnemyId)
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_NO:
      // theTower
      //   .finishTowerFloorEnemyAddition(userRequesting)
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_YES:
      // const selectedFloorToContinue = selectedId ? parseInt(selectedId, TEN) : ZERO;
      // theTower
      //   .setFloorEnemies(userRequesting, selectedFloorToContinue)
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_FLOOR_ID:
      // mutableSelectedFloorId = selectedId ? parseInt(selectedId, TEN) : ZERO;
      // theTower
      //   .setFloorById(userRequesting, mutableSelectedFloorId)
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.ENABLE_HIDING:
      // mutableSelectedFloorId = selectedId ? parseInt(selectedId, TEN) : ZERO;
      // theTower
      //   .setFloorVisibility(
      //     userRequesting,
      //     TOWER_FLOOR_HIDING.ENABLE,
      //     mutableSelectedFloorId
      //   )
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.DISABLE_HIDING:
      // mutableSelectedFloorId = selectedId ? parseInt(selectedId, TEN) : ZERO;
      // theTower
      //   .setFloorVisibility(
      //     userRequesting,
      //     TOWER_FLOOR_HIDING.DISABLE,
      //     mutableSelectedFloorId
      //   )
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    // RAIDER
    case TOWER_SECONDARY_SLACK_ACTIONS.CHOOSE_PERK:
      // const perkSelection = actionParsed.split('-').pop()!;
      // if (!selectedId) {
      //   const replyErrorBody = getEphemeralText(actionReply.raiderNeedsToPickPerk);
      //   return slackRequest(response_url, replyErrorBody).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      // }
      // theTower
      //   .completeChoosePerkOrItem(userRequesting, selectedId, perkSelection)
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   }).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.CHOOSE_ITEM.concat('-', itemPerkSelected || ''):
      // const itemSelection = actionParsed.split('-').pop()!;
      // const selectedItemId = selectedId ? parseInt(selectedId, TEN) : ZERO;
      // if (!selectedItemId) {
      //   const replyErrorBody = getEphemeralText(actionReply.raiderNeedsToPickItem);
      //   return slackRequest(response_url, replyErrorBody).catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      // }
      // theTower
      //   .completeChoosePerkOrItem(userRequesting, selectedItemId, itemSelection)
      //   .then((gameActionResponse) => {
      //     if (gameActionResponse) {
      //       return slackRequest(response_url, gameActionResponse);
      //     }
      //     return undefined;
      //   })
      //   .catch((error) => {
      //     logger.error('Error in Slack Action: The Tower');
      //     logger.error(error);
      //     return getGameError(actionReply.somethingWentWrong);
      //   });
      break;
    default:
      break;
  }
}
