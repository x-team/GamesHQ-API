import type { ArenaPlayer, ArenaZone } from '../../../models';
import { BOSS_HOUSE_EMOJI } from '../../consts/emojis';
import { ZERO } from '../../consts/global';
import { basicHealthDisplayInParentheses, generateTeamEmoji } from '../../helpers';
import type { SlackBlockKitLayoutElement } from '../../model/SlackBlockKit';
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
import { ARENA_SECONDARY_ACTIONS, ARENA_SLACK_COMMANDS } from '../consts';

// ADMIN ////////////////////////////////////////////////////////////////////////////////////////////////
export function generateArenaEndGameConfirmationBlockKit(
  questionText = 'Are you *absolutely sure* you want to *end the game*?'
) {
  return generateEndGameConfirmationBlockKit(
    questionText,
    ARENA_SECONDARY_ACTIONS.CONFIRM_END_GAME,
    ARENA_SECONDARY_ACTIONS.CANCEL_END_GAME
  );
}

// PLAYER ////////////////////////////////////////////////////////////////////////////////////////////////
export function generateSpectatorActionsBlockKit(isDead: boolean): SlackBlockKitLayoutElement[] {
  const mainMessage = isDead
    ? "*YOU'RE DEAD. CHOOSE ACTIONS*"
    : '*CHOOSE A SPECTATOR ACTION FOR THIS ROUND*';
  const mainTitleContextLayout = blockKitContext(mainMessage);
  const personalActionsLayout = blockKitAction([
    blockKitButton('Cheer', ARENA_SLACK_COMMANDS.CHEER),
    blockKitButton('Repeat Last Cheer', ARENA_SLACK_COMMANDS.REPEAT_LAST_CHEER),
  ]);

  return [mainTitleContextLayout, personalActionsLayout];
}

export function generateHunterActionsBlockKit(
  primaryMessageText?: string,
  secondaryMessageText?: string,
  playerIsBoss?: boolean
): SlackBlockKitLayoutElement[] {
  const blockKitDividerSection = blockKitDivider();
  // Block kit Titles and Subtitles (Main Sections)
  const mainTitleContextLayout = blockKitContext('*CHOOSE AN ACTION FOR THIS ROUND*');
  const personalContextLayout = blockKitContext('*PERSONAL*');
  const searchForContextLayout = blockKitContext('*SEARCH FOR A*');
  const actionsContextLayout = blockKitContext('*ACTIONS*');
  const primaryMessageSection = primaryMessageText
    ? [blockKitDividerSection, blockKitMrkdwnSection(primaryMessageText), blockKitDividerSection]
    : [blockKitDividerSection];
  const secondaryMessageSection = secondaryMessageText
    ? [blockKitDividerSection, blockKitMrkdwnSection(secondaryMessageText), blockKitDividerSection]
    : [blockKitDividerSection];

  // Block kit Actions (Buttons)
  const personalButtons = [
    blockKitButton('Status', ARENA_SLACK_COMMANDS.STATUS),
    blockKitButton('Cheer', ARENA_SLACK_COMMANDS.CHEER),
    blockKitButton('Repeat Last Cheer', ARENA_SLACK_COMMANDS.REPEAT_LAST_CHEER),
  ];
  if (playerIsBoss) {
    personalButtons.push(blockKitButton('Change Location', ARENA_SLACK_COMMANDS.CHANGE_LOCATION));
  }
  const personalActionsLayout = blockKitAction(personalButtons);

  const searchButtons = [
    blockKitButton('Weapon', ARENA_SLACK_COMMANDS.SEARCH_WEAPONS),
    blockKitButton('Healthkit', ARENA_SLACK_COMMANDS.SEARCH_HEALTH),
    blockKitButton('Armor', ARENA_SLACK_COMMANDS.SEARCH_ARMOR),
  ];
  const searchActionsLayout = blockKitAction(searchButtons);

  const actionButtons = [
    blockKitButton('Hunt', ARENA_SLACK_COMMANDS.HUNT),
    blockKitButton('Hide', ARENA_SLACK_COMMANDS.HIDE),
    blockKitButton('Heal Me', ARENA_SLACK_COMMANDS.HEAL_OR_REVIVE_SELF),
    blockKitButton('Heal/Revive Other', ARENA_SLACK_COMMANDS.HEAL_OR_REVIVE_OTHER),
  ];
  const actionsLayout = blockKitAction(actionButtons);

  return [
    ...secondaryMessageSection,
    mainTitleContextLayout,
    blockKitDividerSection,
    ...primaryMessageSection,
    personalContextLayout,
    personalActionsLayout,
    blockKitDividerSection,
    searchForContextLayout,
    searchActionsLayout,
    blockKitDividerSection,
    actionsContextLayout,
    actionsLayout,
    blockKitDividerSection,
  ];
}

export function generateArenaActionsBlockKit(
  player: ArenaPlayer,
  primaryMessageText?: string,
  secondaryMessageText?: string
) {
  const playerIsDead = player.health <= ZERO;
  if (player.isSpectator || playerIsDead) {
    return generateSpectatorActionsBlockKit(playerIsDead);
  }

  return generateHunterActionsBlockKit(primaryMessageText, secondaryMessageText, player.isBoss);
}

export function generateArenaTargetPickerBlock(
  players: ArenaPlayer[],
  action: string,
  displayText = 'Please select a target (Player)'
): SlackBlockKitLayoutElement[] {
  const blockKitDividerSection = blockKitDivider();
  const mainMessageSection = blockKitMrkdwnSection(displayText);

  const playersToDropdownOptions = players.map((player) =>
    blockKitCompositionOption(
      `${player.isBoss ? BOSS_HOUSE_EMOJI : generateTeamEmoji(player._team?.emoji!)} <@${
        player._user?.slackId
      }> ${basicHealthDisplayInParentheses(player.health)}`,
      `${player._user?.slackId}`
    )
  );

  const slackSelectTargetMenu = blockKitSelectMenu(
    `arena-${action}-choose-target`,
    'Choose your target',
    playersToDropdownOptions
  );

  const actionLayout = blockKitAction([slackSelectTargetMenu]);

  return [blockKitDividerSection, mainMessageSection, actionLayout];
}

export function generateChangeZonePickerBlock(
  hasChangeLocation: boolean,
  primaryMessageText: string,
  locations: ArenaZone[],
  currentLocation: ArenaZone
): SlackBlockKitLayoutElement[] {
  const blockKitDividerSection = blockKitDivider();
  const changeLocationMessageSection = blockKitMrkdwnSection(
    `Change Location ${currentLocation.emoji}`
  );

  const locationsToDropdownOptions = locations.map((arenaZone) =>
    blockKitCompositionOption(`${arenaZone.emoji} ${arenaZone.name}`, `${arenaZone.id}`)
  );

  const slackChangeZonePickerMenu = blockKitSelectMenu(
    ARENA_SECONDARY_ACTIONS.CHANGE_LOCATION,
    'Where to move after your action?',
    locationsToDropdownOptions
  );

  const actionLayout = blockKitAction([slackChangeZonePickerMenu]);

  const primaryMessageSection = [
    blockKitDividerSection,
    blockKitMrkdwnSection(primaryMessageText),
    blockKitDividerSection,
  ];
  const changeLocationSection = [
    blockKitDividerSection,
    changeLocationMessageSection,
    actionLayout,
  ];
  const fullBlockSection: SlackBlockKitLayoutElement[] = primaryMessageSection;
  if (hasChangeLocation) {
    fullBlockSection.push(...changeLocationSection);
  }
  return fullBlockSection;
}
