import type { Item } from '../../../models';
import { generateRarityColorEmoji } from '../../helpers';
import type {
  SlackBlockKitCompositionOption,
  SlackBlockKitLayoutElement,
} from '../../model/SlackBlockKit';
import {
  blockKitCompositionOption,
  blockKitMrkdwnSection,
  blockKitMultiSelect,
} from '../../utils/generators/slack';
import { ARENA_SECONDARY_ACTIONS } from '../consts';

export function generateMultiSelectWeaponOptions(
  weaponList: Item[]
): SlackBlockKitCompositionOption[] {
  return weaponList.map((weapon) =>
    blockKitCompositionOption(
      `${generateRarityColorEmoji(weapon._itemRarityId)}${weapon.emoji} ${weapon.name}`,
      `${weapon.id}`
    )
  );
}

export function generateNarrowWeaponsBlock(weaponsList: Item[]): SlackBlockKitLayoutElement[] {
  const multiSelect = blockKitMultiSelect(
    ARENA_SECONDARY_ACTIONS.CONFIRM_NARROW_WEAPONS,
    'Select available weapons',
    generateMultiSelectWeaponOptions(weaponsList),
    []
  );
  return [blockKitMrkdwnSection('Select which weapons can be obtained by players.', multiSelect)];
}
