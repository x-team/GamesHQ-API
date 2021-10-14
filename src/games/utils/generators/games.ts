import { ArenaItemInventory, Item, TowerItemInventory } from '../../../models';
import type { ARENA_SECONDARY_ACTIONS } from '../../arena/consts';
import { INFINITY_GIF_EMOJI } from '../../consts/emojis';
import { generateRarityColorEmoji } from '../../helpers';
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

const genericWeaponsOptionBuilder = (
  weapon:
    | Item
    | (Item &
        ({ ArenaItemInventory: ArenaItemInventory } | { TowerItemInventory: TowerItemInventory }))
) => {
  const arenaWeapon = weapon as Item & {
    ArenaItemInventory: ArenaItemInventory;
  };
  const towerWeapon = weapon as Item & {
    TowerItemInventory: TowerItemInventory;
  };

  if (!arenaWeapon.ArenaItemInventory && !towerWeapon.TowerItemInventory) {
    const weaponText =
      `${generateRarityColorEmoji(weapon._itemRarityId)}${weapon.emoji} ` +
      `${weapon.name} x${weapon.usageLimit ?? ` ${INFINITY_GIF_EMOJI}`}`;
    return blockKitCompositionOption(weaponText, `${weapon.id}`);
  } else {
    const isArenaWeapon = arenaWeapon.ArenaItemInventory ? true : false;
    const weaponText =
      `${generateRarityColorEmoji(weapon._itemRarityId)}${weapon.emoji} ` +
      `${weapon.name} x${
        isArenaWeapon
          ? arenaWeapon.ArenaItemInventory.remainingUses ?? ` ${INFINITY_GIF_EMOJI}`
          : towerWeapon.TowerItemInventory.remainingUses ?? ` ${INFINITY_GIF_EMOJI}`
      }`;
    return blockKitCompositionOption(weaponText, `${weapon.id}`);
  }
};

export function generateGenericWeaponPickerBlock(
  displayText: string,
  weapons:
    | Array<
        Item &
          ({ ArenaItemInventory: ArenaItemInventory } | { TowerItemInventory: TowerItemInventory })
      >
    | Item[],
  defaultWeapon:
    | (Item &
        ({ ArenaItemInventory: ArenaItemInventory } | { TowerItemInventory: TowerItemInventory }))
    | null
    | Item,
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
