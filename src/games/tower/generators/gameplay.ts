import { TowerRaider } from '../../../models';
import { SlackBlockKitLayoutElement } from '../../model/SlackBlockKit';
import { generateEndGameConfirmationBlockKit } from '../../utils/generators/games';
import {
  blockKitAction,
  blockKitButton,
  blockKitCompositionOption,
  blockKitContext,
  blockKitDivider,
  blockKitMrkdwnSection,
  blockKitSelectMenu,
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
  const searchActionsLayout = blockKitAction(searchButtons);

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
  const actionsLayout = blockKitAction(actionButtons);

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

export function generateTowerStartRoundQuestionSection(displayText: string) {
  const blockKitDividerSection = blockKitDivider();

  const mainMessageSection = blockKitMrkdwnSection(displayText);
  const questionText = `Want to *start the round* now?`;
  const slackMainMessageSection = blockKitMrkdwnSection(questionText);

  const slackActionLayout = blockKitAction([
    blockKitButton('Start!', TOWER_SLACK_COMMANDS.START_ROUND_FROM_QUESTION, undefined, 'primary'),
    blockKitButton(
      'Change Action',
      TOWER_SLACK_COMMANDS.ACTIONS_FROM_QUESTION,
      undefined,
      'danger'
    ),
  ]);

  return [
    blockKitDividerSection,
    mainMessageSection,
    blockKitDividerSection,
    slackMainMessageSection,
    slackActionLayout,
  ];
}

export function generateTowerTargetRaiderPickerBlock(
  raiders: TowerRaider[],
  defaultPlayerSlackId: string,
  action: string,
  displayText = 'Please select a target'
): SlackBlockKitLayoutElement[] {
  const blockKitDividerSection = blockKitDivider();
  const mainMessageSection = blockKitMrkdwnSection(displayText);

  const raidersToDropdownOptions = raiders.map((raider) =>
    blockKitCompositionOption(`<@${raider._user?.slackId}>`, `${raider._user?.slackId}`)
  );

  const targetMenuInitialOption = blockKitCompositionOption(
    `<@${defaultPlayerSlackId}>`,
    defaultPlayerSlackId
  );
  const slackSelectTargetMenu = blockKitSelectMenu(
    `${action}-choose-target`,
    'Choose your target',
    raidersToDropdownOptions,
    targetMenuInitialOption
  );

  const actionLayout = blockKitAction([slackSelectTargetMenu]);

  return [blockKitDividerSection, mainMessageSection, actionLayout];
}
