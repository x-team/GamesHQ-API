import { actionReply } from '.';
import { logger } from '../../../config';
import { getUserBySlackId } from '../../../models/User';
import { SlackDialogSubmissionPayload, TowerFormData } from '../../model/SlackDialogObject';
import { getGameError } from '../../utils';
import { TOWER_SECONDARY_SLACK_ACTIONS } from '../consts';
import { TowerEngine } from '../repositories/tower/engine';
import { TowerRepository } from '../repositories/tower/tower';
import { theTowerNotifyEphemeral } from '../utils';

const theTower = new TowerRepository(TowerEngine.getInstance());

export const handleTowerAction = async (payload: SlackDialogSubmissionPayload) => {
  const {
    user: { id: userSlackId },
    view,
  } = payload;
  const {
    callback_id,
    state: { values },
  } = view;
  const userRequesting = await getUserBySlackId(userSlackId);
  if (!userRequesting) {
    return getGameError(actionReply.userNotFound(userSlackId));
  }

  switch (callback_id) {
    case TOWER_SECONDARY_SLACK_ACTIONS.CREATE_OR_UPDATE_ENEMY_DATA:
      // enemyBot
      //   .createOrUpdateEnemyForm(userRequesting, values as EnemyData)
      //   .then(async (response) => {
      //     if (response?.type === 'error') {
      //       await theTowerNotifyEphemeral(
      //         response.text ?? 'Something went wrong',
      //         userRequesting.slackId!,
      //         userRequesting.slackId!
      //       );
      //     }
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.CREATE_OR_UPDATE_WEAPON_DATA:
      // weaponRepository
      //   .createOrUpdateWeaponForm(userRequesting, values as WeaponData)
      //   .then(async (response) => {
      //     if (response?.type === 'error') {
      //       await theTowerNotifyEphemeral(
      //         response.text ?? 'Something went wrong',
      //         userRequesting.slackId!,
      //         userRequesting.slackId!
      //       );
      //     }
      //   });
      break;
    case TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_ID:
      theTower
        .updateTowerBasicInfoForm(userRequesting, values as TowerFormData)
        .then(async (response) => {
          if (response?.type === 'error') {
            await theTowerNotifyEphemeral(
              response.text ?? 'Something went wrong',
              userRequesting.slackId!,
              userRequesting.slackId!
            );
          }
        });
      break;
    default:
      logger.error(actionReply.somethingWentWrong);
      break;
  }
  // We need to respond to Slack within 3000ms or the action will fail.
  // So we need this line
  return {};
};
