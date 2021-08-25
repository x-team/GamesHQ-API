import { actionReply } from '.';
import { logger } from '../../../config';
import { getUserBySlackId } from '../../../models/User';
import { SlackShortcutPayload } from '../../model/SlackShortcutPayload';
import { adminAction, getGameError } from '../../utils';
import { theTowerNotifyEphemeral } from '../utils';

export async function handleTowerShortcut(payload: SlackShortcutPayload) {
  const {
    callback_id,
    user: { id: userSlackId },
    // trigger_id,
  } = payload;
  const userRequesting = await getUserBySlackId(userSlackId);
  if (!userRequesting) {
    return getGameError(actionReply.userNotFound(userSlackId));
  }
  const isAdmin = await adminAction(userRequesting);
  if (!isAdmin) {
    return theTowerNotifyEphemeral(
      'Only admins or community team can perform this action',
      userRequesting.slackId!,
      userRequesting.slackId!
    );
  }
  switch (callback_id) {
    // case TOWER_SLACK_ACTIONS.CREATE_ENEMY:
    //   const storeDialogView = generateEnemyDialogView();
    //   theTowerOpenView({
    //     trigger_id,
    //     view: storeDialogView,
    //   }).catch((error) => {
    //     handleException({ error, plugin: 'slack' });
    //   });
    //   break;
    default:
      logger.error(actionReply.somethingWentWrong);
      break;
  }

  return {};
}
