import { ARENA_SECONDARY_ACTIONS } from '../../arena/consts';
import { blockKitAction, blockKitButton, blockKitDivider, blockKitMrkdwnSection } from './slack';

export function generateEndGameConfirmationBlockKit(
  questionText = 'Are you *absolutely sure* you want to *end the game*?',
  confirmActionValue: ARENA_SECONDARY_ACTIONS, // | TOWER_SECONDARY_SLACK_ACTIONS,
  cancelActionValue: ARENA_SECONDARY_ACTIONS // || TOWER_SECONDARY_SLACK_ACTIONS,
) {
  const blockKitDividerSection = blockKitDivider();

  const slackMainMessageSection = blockKitMrkdwnSection(questionText);

  const slackActionLayout = blockKitAction([
    blockKitButton('End Game', confirmActionValue, undefined, 'danger'),
    blockKitButton('Cancel', cancelActionValue),
  ]);
  return [blockKitDividerSection, slackMainMessageSection, slackActionLayout];
}
