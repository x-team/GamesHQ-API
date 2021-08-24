import { isNaN } from 'lodash';
import { logger } from '../../../config';
import { User } from '../../../models';
import { getUserBySlackId } from '../../../models/User';
import { gameResponseToSlackHandler } from '../../../modules/slack/utils';
import { parseEscapedSlackId } from '../../../utils/slack';
import { SAD_PARROT } from '../../consts/emojis';
import { TEN, ZERO } from '../../consts/global';

import { randomSkinColor } from '../../helpers';
import type {
  SlackBlockKitButtonElement,
  SlackBlockKitSelectMenuElement,
} from '../../model/SlackBlockKit';
import { SlackBlockKitPayload } from '../../model/SlackBlockKitPayload';
import { extractSecondaryAction, getEphemeralText, getGameError, slackRequest } from '../../utils';
import { TOWER_SECONDARY_SLACK_ACTIONS } from '../consts';
import { TowerEngine } from '../repositories/tower/engine';
import { TowerRepository } from '../repositories/tower/tower';
import { isTowerConfigAction, isTowerRaiderWithParamsAction } from '../utils';

const theTower = new TowerRepository(TowerEngine.getInstance());

const actionReply = {
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
  logger.debug({ selectedId });
  switch (action) {
    // // RAIDER
    // case TOWER_SLACK_COMMANDS.HIDE:
    //   return theTower.hide(userRequesting);
    // case TOWER_SLACK_COMMANDS.SEARCH_HEALTH:
    //   return theTower.searchForHealth(userRequesting);
    // case TOWER_SLACK_COMMANDS.SEARCH_WEAPONS:
    //   return theTower.searchForWeapons(userRequesting);
    // case TOWER_SLACK_COMMANDS.SEARCH_ARMOR:
    //   return theTower.searchForArmors(userRequesting);
    // case TOWER_SLACK_COMMANDS.HEAL_OR_REVIVE_OTHER:
    //   return theTower.reviveOther(userRequesting);
    // case TOWER_SLACK_COMMANDS.HEAL_OR_REVIVE_SELF:
    //   return theTower.reviveSelf(userRequesting);
    // case TOWER_SLACK_COMMANDS.HUNT:
    //   return theTower.hunt(userRequesting);
    // case TOWER_SLACK_COMMANDS.REPEAT_LAST_ACTION:
    //   return theTower.repeatLastAction(userRequesting);
    // case TOWER_SLACK_COMMANDS.RE_ENTER_BUTTON:
    //   return theTower.enter(userRequesting);
    // case TOWER_SLACK_COMMANDS.PROGRESS_BUTTON:
    //   return theTower.displayProgress(userRequesting);
    // case TOWER_SLACK_COMMANDS.ACTIONS_FROM_QUESTION:
    //   return theTower.raiderActions(userRequesting);
    // case TOWER_SLACK_COMMANDS.START_ROUND_FROM_QUESTION:
    //   theTower.startRound(userRequesting).catch((error) => {
    //     handleException({ error, plugin: 'slack' });
    //   });
    //   return getEphemeralText('Starting Round');
    // case TOWER_SECONDARY_SLACK_ACTIONS.HUNT_CHOOSE_WEAPON:
    //   return theTower.chooseWeapon(userRequesting, selectedId);
    // case TOWER_SECONDARY_SLACK_ACTIONS.HEAL_OR_REVIVE_CHOOSE_TARGET:
    //   return theTower.completeRevive(userRequesting, selectedId);
    // case TOWER_SECONDARY_SLACK_ACTIONS.HUNT_CHOOSE_TARGET:
    //   return theTower.chooseTarget(userRequesting, selectedId);
    // ADMIN
    case TOWER_SECONDARY_SLACK_ACTIONS.CONFIRM_END_GAME:
      return theTower.endGame(userRequesting);
    case TOWER_SECONDARY_SLACK_ACTIONS.CANCEL_END_GAME:
      return theTower.cancelEndGame(userRequesting);
    default:
      return Promise.resolve(getGameError('Please provide a valid The Tower action'));
  }
}

// export const handleTowerShortcut = async (payload: SlackShortcutPayload) => {
//   const {
//     callback_id,
//     user: { id: userSlackId },
//     trigger_id,
//   } = payload;
//   let mutableUserRequesting;
//   try {
//     mutableUserRequesting = await getUserBySlackId(userSlackId);
//   } catch {
//     return getEphemeralText(`:sad-parrot: User with slack ID: <@${userSlackId}> not found`);
//   }
//   const isAdmin = await adminAction(mutableUserRequesting);
//   if (!isAdmin) {
//     return theTowerNotifyEphemeral(
//       'Only admins or community team can perform this action',
//       mutableUserRequesting.slackId!,
//       mutableUserRequesting.slackId!
//     );
//   }
//   switch (callback_id) {
//     case TOWER_SLACK_ACTIONS.CREATE_ENEMY:
//       const storeDialogView = generateEnemyDialogView();
//       theTowerOpenView({
//         trigger_id,
//         view: storeDialogView,
//       }).catch((error) => {
//         handleException({ error, plugin: 'slack' });
//       });
//       break;
//     default:
//       console.error(actionReply.somethingWentWrong);
//       break;
//   }

//   return {};
// };

// export const handleTowerAction = async (payload: SlackDialogSubmissionPayload) => {
//   const {
//     user: { id: userSlackId },
//     view,
//   } = payload;
//   const {
//     callback_id,
//     state: { values },
//   } = view;
//   const userRequesting = await getUserBySlackId(userSlackId);
//   if (!userRequesting) {
//     return getGameError(actionReply.userNotFound(userSlackId));
//   }

//   switch (callback_id) {
//     case TOWER_SECONDARY_SLACK_ACTIONS.CREATE_OR_UPDATE_ENEMY_DATA:
//       enemyBot
//         .createOrUpdateEnemyForm(mutableUserRequesting, values as EnemyData)
//         .then(async (response) => {
//           if (response?.type === 'error') {
//             await theTowerNotifyEphemeral(
//               response.text ?? 'Something went wrong',
//               userRequesting.slackId!,
//               userRequesting.slackId!
//             );
//           }
//         });
//       break;
//     case TOWER_SECONDARY_SLACK_ACTIONS.CREATE_OR_UPDATE_WEAPON_DATA:
//       weaponRepository
//         .createOrUpdateWeaponForm(mutableUserRequesting, values as WeaponData)
//         .then(async (response) => {
//           if (response?.type === 'error') {
//             await theTowerNotifyEphemeral(
//               response.text ?? 'Something went wrong',
//               userRequesting.slackId!,
//               userRequesting.slackId!
//             );
//           }
//         });
//       break;
//     case TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_ID:
//       theTower
//         .updateTowerBasicInfoForm(mutableUserRequesting, values as TowerFormData)
//         .then(async (response) => {
//           if (response?.type === 'error') {
//             await theTowerNotifyEphemeral(
//               response.text ?? 'Something went wrong',
//               userRequesting.slackId!,
//               userRequesting.slackId!
//             );
//           }
//         });
//       break;
//     default:
//       console.error(actionReply.somethingWentWrong);
//       break;
//   }
//   // We need to respond to Slack within 3000ms or the action will fail.
//   // So we need this line
//   return {};
// };

export const handleTowerBlockAction = async (payload: SlackBlockKitPayload) => {
  const {
    response_url,
    user: { id: userSlackId },
    // trigger_id,
    actions: [actionSelected],
  } = payload;
  const { action_id /*value*/ } = actionSelected as SlackBlockKitButtonElement;
  const userRequesting = await getUserBySlackId(userSlackId);
  if (!userRequesting) {
    return getGameError(actionReply.userNotFound(userSlackId));
  }
  // const [action, argumentId] = value?.split('_') ?? [];
  // switch (action) {
  //   case 'deleteweapon':
  //     await weaponRepository
  //       .deleteArenaWeapon(mutableUserRequesting, argumentId)
  //       .catch((error) => handleException({ error, plugin: 'slack' }));
  //     break;
  //   case 'editweapon':
  //     await weaponRepository.openCreateOrUpdateModal(trigger_id, parseInt(argumentId));
  //     break;
  //   case 'Edit':
  //     enemyBot
  //       .createOrUpdateEnemyModal(mutableUserRequesting, trigger_id, argumentId)
  //       .catch((error) => handleException({ error, plugin: 'slack' }));
  //     break;
  //   case 'Delete':
  //     enemyBot
  //       .deleteEnemy(mutableUserRequesting, argumentId)
  //       .catch((error) => handleException({ error, plugin: 'slack' }));
  //     break;
  // }
  const isConfigAction = isTowerConfigAction(action_id);
  const isRaiderWithParamsAction = isTowerRaiderWithParamsAction(action_id);
  if (isConfigAction || isRaiderWithParamsAction) {
    const { action: actionParsed /*selectedId*/ } = extractSecondaryAction(action_id);
    const itemPerkSelected = actionParsed.split('-').pop();
    const {
      /*selected_option*/
    } = actionSelected as SlackBlockKitSelectMenuElement;
    // let mutableSelectedId = 0;
    // let mutableSelectedFloorId = 0;
    switch (actionParsed) {
      // ADMIN
      case TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_ID:
        // const selectedTowerId = selectedId ? parseInt(selectedId, TEN) : ZERO;
        // theTower
        //   .updateTowerBasicInfo(mutableUserRequesting, trigger_id, selectedTowerId)
        //   .then((gameActionResponse) => {
        //     const replyToPlayerBody = gameResponseToSlackHandler(gameActionResponse);
        //     return slackRequest(response_url, replyToPlayerBody);
        //   }).catch((error) => {
        //     logger.error('Error in Slack Action: The Tower');
        //     logger.error(error);
        //     return getGameError(actionReply.somethingWentWrong);
        //   });
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
        //   .addEnemyToTowerFloor(mutableUserRequesting, selectedFloorNumber, mutableSelectedId)
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
        //   .addEnemyAmountToTowerFloor(mutableUserRequesting, selectedEnemyId, selected_option.value)
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
        //   .removeEnemyFromTowerFloor(mutableUserRequesting, selectedTowerFloorEnemyId)
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
        //   .finishTowerFloorEnemyAddition(mutableUserRequesting)
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
        //   .setFloorEnemies(mutableUserRequesting, selectedFloorToContinue)
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
        //   .setFloorById(mutableUserRequesting, mutableSelectedFloorId)
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
        //     mutableUserRequesting,
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
        //     mutableUserRequesting,
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
        //   .completeChoosePerkOrItem(mutableUserRequesting, selectedId, perkSelection)
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
        //   .completeChoosePerkOrItem(mutableUserRequesting, selectedItemId, itemSelection)
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
