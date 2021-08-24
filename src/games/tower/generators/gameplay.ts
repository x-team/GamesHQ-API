import { generateEndGameConfirmationBlockKit } from '../../utils/generators/games';
import { TOWER_SECONDARY_SLACK_ACTIONS } from '../consts';

// ADMIN ////////////////////////////////////////////////////////////////////////////////////////////////
export function generateTowerEndGameConfirmationBlockKit(
  questionText = 'Are you *absolutely sure* you want to _close The Tower_ and *end the game for everyone*?'
) {
  return generateEndGameConfirmationBlockKit(
    questionText,
    TOWER_SECONDARY_SLACK_ACTIONS.CONFIRM_END_GAME,
    TOWER_SECONDARY_SLACK_ACTIONS.CANCEL_END_GAME
  );
}
