import { logger } from '../../../config';
import type { User } from '../../../models';
import { SPINNER_EMOJI } from '../../consts/emojis';
import { getGameResponse } from '../../utils';
import { TOWER_SLACK_COMMANDS } from '../consts';
import { TowerEngine } from '../repositories/tower/engine';
import { TowerRepository } from '../repositories/tower/tower';

const theTower = new TowerRepository(TowerEngine.getInstance());

interface TowerSwitchCommandOptions {
  command: string;
  commandText: string;
  userRequesting: User;
  triggerId?: string;
}

export function towerSwitchCommand({
  command,
  userRequesting,
  commandText,
  triggerId,
}: TowerSwitchCommandOptions) {
  logger.debug({ triggerId });
  switch (command) {
    // ADMIN
    case TOWER_SLACK_COMMANDS.CREATE_TOWER:
      return theTower.newGame(commandText, userRequesting);
    case TOWER_SLACK_COMMANDS.FINISH_TOWER:
      return theTower.askEndGame(userRequesting);
    case TOWER_SLACK_COMMANDS.TOWER_OPEN:
      return theTower.openOrCloseTowerGates(userRequesting, true);
    case TOWER_SLACK_COMMANDS.TOWER_CLOSED:
      return theTower.openOrCloseTowerGates(userRequesting, false);
    case TOWER_SLACK_COMMANDS.TOWER_INFO:
      return theTower.displayTowerInfo(userRequesting);
    case TOWER_SLACK_COMMANDS.DISPLAY_SCOREBOARD:
      return theTower.displayScoreboard(userRequesting);
    case TOWER_SLACK_COMMANDS.SET_TOWER_FLOORS:
      return theTower.setFloorEnemies(userRequesting);
    // case TOWER_SLACK_COMMANDS.CREATE_WEAPON:
    //   return theTower.openCreateWeaponModal(userRequesting, triggerId);
    // case TOWER_SLACK_COMMANDS.UPDATE_WEAPON:
    //   return theTower.updateWeaponsList(userRequesting);
    // case TOWER_SLACK_COMMANDS.UPDATE_ENEMY:
    //   return enemyBotSingleton.displayAvailableEnemies(userRequesting, 'Edit');
    // case TOWER_SLACK_COMMANDS.DELETE_ENEMY:
    //   return enemyBotSingleton.displayAvailableEnemies(userRequesting, 'Delete');

    // RAIDER
    case TOWER_SLACK_COMMANDS.ENTER:
      return theTower.enterTheTower(userRequesting);
    case TOWER_SLACK_COMMANDS.EXIT:
      return theTower.exitTheTower(userRequesting);
    case TOWER_SLACK_COMMANDS.ACTIONS:
      return theTower.raiderActions(userRequesting);
    case TOWER_SLACK_COMMANDS.PROGRESS:
      return theTower.displayProgress(userRequesting);
    case TOWER_SLACK_COMMANDS.START_ROUND:
      // theTower.startRound(userRequesting)
      //   .then(async (reply) => {
      //     const slackResponseBody = gameResponseToSlackHandler(reply);
      //     await theTowerNotifyEphemeral(
      //       slackResponseBody.text ?? 'Something went wrong',
      //       userRequesting.slackId!,
      //       userRequesting.slackId!
      //     );
      //   })
      //   .catch(async (e) => {
      //     logger.error('Error in Slack Command: The Tower');
      //     logger.error(e);
      //     await theTowerNotifyEphemeral(
      //       'Something went wrong',
      //       userRequesting.slackId!,
      //       userRequesting.slackId!
      //     );
      //   });
      return getGameResponse(`Starting round ${SPINNER_EMOJI}`);
    default:
      return getGameResponse('Please provide a valid The Tower command');
  }
}
