import type { Enemy, TowerFloor } from '../../../models';
import { FULL_HEALTH_HEART_EMOJI } from '../../consts/emojis';
import { basicHealthDisplayInParentheses } from '../../helpers';
import type {
  SlackBlockKitCompositionOption,
  SlackBlockKitLayoutElement,
} from '../../model/SlackBlockKit';
import {
  blockKitAction,
  blockKitButton,
  blockKitCompositionOption,
  blockKitDivider,
  blockKitHeader,
  blockKitMrkdwnSection,
  blockKitSelectMenu,
} from '../../utils/generators/slack';
import { TOWER_SECONDARY_SLACK_ACTIONS } from '../consts';

const blockKitDividerSection = blockKitDivider();

export function generateTowerFloorSpecs(floor: TowerFloor): SlackBlockKitLayoutElement[] {
  // Block kit Titles and Subtitles (Main Sections)
  const mainTitleHeaderLayout = blockKitHeader(`Tower Floor #${floor.number}`);
  const enemiesTitleSectionLayout = blockKitMrkdwnSection('*Enemies*');
  const infoTitleSectionLayout = blockKitMrkdwnSection(
    '*Basic Info*' +
      `\n\t_${
        floor.isEveryoneVisible ? `There's no place to hide in this floor` : 'Raiders can hide'
      }_`,
    blockKitButton(
      `${floor.isEveryoneVisible ? 'Enable' : 'Disable'} Hiding`,
      `${
        floor.isEveryoneVisible
          ? `${TOWER_SECONDARY_SLACK_ACTIONS.ENABLE_HIDING}-${floor.id}`
          : `${TOWER_SECONDARY_SLACK_ACTIONS.DISABLE_HIDING}-${floor.id}`
      }`
    )
  );

  // Detail Section
  const enemiesSection =
    floor._floorEnemies?.map((enemy) =>
      blockKitMrkdwnSection(
        `\t${enemy._enemy?.emoji} ` +
          `${enemy._enemy?.name} ` +
          `( ${FULL_HEALTH_HEART_EMOJI} ${enemy._enemy?.health} ) ${
            enemy._enemy?.isBoss ? '*[Boss]*' : ''
          }`,
        blockKitButton(
          'Remove',
          `${TOWER_SECONDARY_SLACK_ACTIONS.REMOVE_ENEMY_FROM_TOWER_FLOOR}-${enemy.id}`
        )
      )
    ) || [];
  const configButtons = [
    blockKitButton(
      'Add Enemy',
      `${TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_YES}-${floor.number}`
    ),
  ];
  const configActionsLayout = blockKitAction(configButtons);

  return [
    blockKitDividerSection,
    mainTitleHeaderLayout,
    blockKitDividerSection,
    infoTitleSectionLayout,
    blockKitDividerSection,
    enemiesTitleSectionLayout,
    ...enemiesSection,
    configActionsLayout,
  ];
}

export function generateFloorEnemyPickerBlock(
  displayText: string,
  enemies: Enemy[],
  action: string
): SlackBlockKitLayoutElement[] {
  const mainMessageSection = blockKitMrkdwnSection(displayText);
  const titleMessageSection = blockKitMrkdwnSection('Please select the enemy you want to add:');
  const enemiesToDropdownOptions = enemies.map((enemy) =>
    blockKitCompositionOption(
      `${enemy.emoji} | ${enemy.name} ${
        enemy.isBoss ? '[Boss]' : ''
      } ${basicHealthDisplayInParentheses(enemy.health)}`,
      `${enemy.id}`
    )
  );

  const selectWeaponsMenu = blockKitSelectMenu(action, 'Choose an enemy', enemiesToDropdownOptions);

  const actionLayout = blockKitAction([selectWeaponsMenu]);

  return [
    blockKitDividerSection,
    mainMessageSection,
    blockKitDividerSection,
    titleMessageSection,
    actionLayout,
  ];
}

export function generateFloorEnemyAmountPickerBlock(
  displayText: string,
  floorNumber: number,
  enemy: Enemy,
  action: string
): SlackBlockKitLayoutElement[] {
  const TWENTY = 20;
  const mainMessageSection = blockKitMrkdwnSection(displayText);
  const titleMessageSection = blockKitMrkdwnSection(
    `How many _"${enemy.name}"_ enemies do you want to add to this floor?`
  );
  const numbersToDropdownOptions: SlackBlockKitCompositionOption[] = [];
  for (let mutableIndex = 1; mutableIndex <= TWENTY; mutableIndex++) {
    numbersToDropdownOptions.push(
      blockKitCompositionOption(`${mutableIndex}`, `${floorNumber}-${mutableIndex}`)
    );
  }
  const selectWeaponsMenu = blockKitSelectMenu(
    action,
    'Choose an amount',
    numbersToDropdownOptions
  );

  const actionLayout = blockKitAction([selectWeaponsMenu]);

  return [
    blockKitDividerSection,
    mainMessageSection,
    blockKitDividerSection,
    titleMessageSection,
    actionLayout,
  ];
}

export function generateTowerValidationQuestionSection(displayText: string, floorNumber: number) {
  const mainMessageSection = blockKitMrkdwnSection(displayText);
  const questionText = `Do you want to add *other* (different) enemies to this floor?`;
  const slackMainMessageSection = blockKitMrkdwnSection(questionText);

  const validationButtons = [
    blockKitButton(
      'Oh, Yes!',
      TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_YES,
      undefined,
      'primary',
      `${TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_YES}-${floorNumber}`
    ),
    blockKitButton(
      `No, it's enough`,
      TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_NO,
      undefined,
      'danger',
      `${TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR_BTN_NO}-${floorNumber}`
    ),
  ];
  const slackActionLayout = blockKitAction(validationButtons);
  return [
    blockKitDividerSection,
    mainMessageSection,
    blockKitDividerSection,
    slackMainMessageSection,
    slackActionLayout,
  ];
}
