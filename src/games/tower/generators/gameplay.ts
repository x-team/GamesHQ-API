import { SlackBlockKitActionLayout, SlackBlockKitLayoutElement } from '../../model/SlackBlockKit';
import { generateEndGameConfirmationBlockKit } from '../../utils/generators/games';
import {
  blockKitAction,
  blockKitButton,
  blockKitContext,
  blockKitDivider,
  blockKitMrkdwnSection,
} from '../../utils/generators/slack';
import { TOWER_SECONDARY_SLACK_ACTIONS, TOWER_SLACK_COMMANDS } from '../consts';

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

export function generateTowerActionsBlockKit(
  hudText: string,
  actionFailedText?: string
): SlackBlockKitLayoutElement[] {
  const blockKitDividerSection = blockKitDivider();
  // Block kit Titles and Subtitles (Main Sections)
  const searchForContextLayout = blockKitContext('*SEARCH FOR A*');
  const actionsContextLayout = blockKitContext('*ACTIONS*');
  const hudSection = [
    blockKitDividerSection,
    blockKitMrkdwnSection(hudText),
    blockKitDividerSection,
  ];
  const actionSentFailedSection = actionFailedText
    ? [blockKitDividerSection, blockKitMrkdwnSection(actionFailedText), blockKitDividerSection]
    : [blockKitDividerSection];

  const searchButtons = [
    blockKitButton('Weapon', TOWER_SLACK_COMMANDS.SEARCH_WEAPONS),
    blockKitButton('Healthkit', TOWER_SLACK_COMMANDS.SEARCH_HEALTH),
    blockKitButton('Armor', TOWER_SLACK_COMMANDS.SEARCH_ARMOR),
  ];
  const searchActionsLayout: SlackBlockKitActionLayout = blockKitAction(searchButtons);

  const actionButtons = [
    blockKitButton('Hunt', TOWER_SLACK_COMMANDS.HUNT),
    blockKitButton('Hide', TOWER_SLACK_COMMANDS.HIDE),
    blockKitButton('Heal Me', TOWER_SLACK_COMMANDS.HEAL_OR_REVIVE_SELF),
    blockKitButton(
      'Repeat Last Action',
      TOWER_SLACK_COMMANDS.REPEAT_LAST_ACTION,
      undefined,
      'primary'
    ),
    blockKitButton('Progress', TOWER_SLACK_COMMANDS.PROGRESS_BUTTON),
  ];
  const actionsLayout: SlackBlockKitActionLayout = blockKitAction(actionButtons);

  return [
    ...actionSentFailedSection,
    ...hudSection,
    searchForContextLayout,
    searchActionsLayout,
    blockKitDividerSection,
    actionsContextLayout,
    actionsLayout,
    blockKitDividerSection,
  ];
}
