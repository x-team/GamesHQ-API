import { Item } from '../../../models';
import type { ARENA_SECONDARY_ACTIONS } from '../../arena/consts';
import { SlackBlockKitCompositionOption } from '../../model/SlackBlockKit';
import { TOWER_SECONDARY_SLACK_ACTIONS } from '../../tower/consts';

import {
  blockKitAction,
  blockKitButton,
  blockKitCompositionOption,
  blockKitDivider,
  blockKitMrkdwnSection,
  blockKitSelectMenu,
} from './slack';

export function generateEndGameConfirmationBlockKit(
  questionText: string = 'Are you *absolutely sure* you want to *end the game*?',
  confirmActionValue: ARENA_SECONDARY_ACTIONS | TOWER_SECONDARY_SLACK_ACTIONS,
  cancelActionValue: ARENA_SECONDARY_ACTIONS | TOWER_SECONDARY_SLACK_ACTIONS
) {
  const blockKitDividerSection = blockKitDivider();

  const slackMainMessageSection = blockKitMrkdwnSection(questionText);

  const slackActionLayout = blockKitAction([
    blockKitButton('End Game', confirmActionValue, undefined, 'danger'),
    blockKitButton('Cancel', cancelActionValue),
  ]);
  return [blockKitDividerSection, slackMainMessageSection, slackActionLayout];
}

const genericWeaponsOptionBuilder = (weapon: Item) => {
  const weaponText = `${weapon.emoji} ${weapon.name} `;
  return blockKitCompositionOption(weaponText, `${weapon.id}`);
};

export function generateGenericWeaponPickerBlock(
  displayText: string,
  weapons: Item[],
  defaultWeapon: Item | null,
  action: string
) {
  const blockKitDividerSection = blockKitDivider();

  const mainMessageSection = blockKitMrkdwnSection(displayText);
  const weaponsToDropdownOptions: SlackBlockKitCompositionOption[] = weapons.map(
    genericWeaponsOptionBuilder
  );
  const weaponInitialSelected: SlackBlockKitCompositionOption | undefined = defaultWeapon
    ? genericWeaponsOptionBuilder(defaultWeapon)
    : undefined;

  const selectWeaponsMenu = blockKitSelectMenu(
    `${action}`,
    'Choose a weapon',
    weaponsToDropdownOptions,
    weaponInitialSelected
  );

  const actionLayout = blockKitAction([selectWeaponsMenu]);
  return [blockKitDividerSection, mainMessageSection, actionLayout];
}
