import type { ArenaZone } from '../../../models';
import { APPROVE_SIGN } from '../../consts/emojis';
import type {
  SlackBlockKitActionLayout,
  SlackBlockKitCompositionOption,
  SlackBlockKitDividerLayout,
  SlackBlockKitLayoutElement,
  SlackBlockKitSectionLayout,
  SlackBlockKitSelectMenuElement,
} from '../../model/SlackBlockKit';
import { SlackDialog } from '../../model/SlackDialogObject';
import { generateEndGameConfirmationBlockKit } from '../../utils/generators/games';
import {
  blockKitAction,
  blockKitButton,
  blockKitCompositionOption,
  blockKitCompositionText,
  blockKitConfirmDialog,
  blockKitContext,
  blockKitDialogObject,
  blockKitInputField,
  blockKitInputText,
  blockKitMrkdwnSection,
  blockKitMultiSelect,
  blockKitSelectMenu,
} from '../../utils/generators/slack';
import { ARENA_SECONDARY_ACTIONS, ARENA_ZONE_RING } from '../consts';

export function generateArenaEndGameConfirmationBlockKit(
  questionText = 'Are you *absolutely sure* you want to *end the game*?'
) {
  return generateEndGameConfirmationBlockKit(
    questionText,
    ARENA_SECONDARY_ACTIONS.CONFIRM_END_GAME,
    ARENA_SECONDARY_ACTIONS.CANCEL_END_GAME
  );
}

export function generateChangeZonePickerBlock(
  hasChangeLocation: boolean,
  primaryMessageText: string,
  locations: ArenaZone[],
  currentLocation: ArenaZone
): SlackBlockKitLayoutElement[] {
  const blockKitDivider: SlackBlockKitDividerLayout = {
    type: 'divider',
  };
  const changeLocationMessageSection = blockKitMrkdwnSection(
    `Change Location ${currentLocation.emoji}`
  );

  const locationsToDropdownOptions: SlackBlockKitCompositionOption[] = locations.map((arenaZone) =>
    blockKitCompositionOption(`${arenaZone.emoji} ${arenaZone.name}`, `${arenaZone.id}`)
  );

  const slackChangeZonePickerMenu: SlackBlockKitSelectMenuElement = blockKitSelectMenu(
    ARENA_SECONDARY_ACTIONS.CHANGE_LOCATION,
    'Where to move after your action?',
    locationsToDropdownOptions
  );

  const actionLayout = blockKitAction([slackChangeZonePickerMenu]);

  const primaryMessageSection = [
    blockKitDivider,
    blockKitMrkdwnSection(primaryMessageText),
    blockKitDivider,
  ];
  const changeLocationSection = [blockKitDivider, changeLocationMessageSection, actionLayout];
  const fullBlockSection: SlackBlockKitLayoutElement[] = primaryMessageSection;
  if (hasChangeLocation) {
    fullBlockSection.push(...changeLocationSection);
  }
  return fullBlockSection;
}

export function generateMultiSelectZoneOptions(
  zones: ArenaZone[]
): SlackBlockKitCompositionOption[] {
  return zones.map((zone) =>
    blockKitCompositionOption(`(${zone.ring}) ${zone.emoji} ${zone.name}`, `${zone.id}`)
  );
}

export function generateNarrowZonesBlock(zones: ArenaZone[]): SlackBlockKitLayoutElement[] {
  const multiSelect = blockKitMultiSelect(
    ARENA_SECONDARY_ACTIONS.CONFIRM_NARROW_ZONES,
    'Which zones should show up?',
    generateMultiSelectZoneOptions(zones),
    undefined
  );
  return [blockKitMrkdwnSection('Select which zones can show up during gameplay.', multiSelect)];
}

export function generateAvailableZonesBlockKit(zones: ArenaZone[]): SlackBlockKitLayoutElement[] {
  const blockKitDivider: SlackBlockKitDividerLayout = {
    type: 'divider',
  };
  // Block kit Titles and Subtitles (Main Sections)
  const mainTitleContextLayout = blockKitContext('*AVAILABLE ARENA ZONES*');

  // Block kit Actions (Buttons)
  const zonesSection = zones.map((zone) =>
    blockKitMrkdwnSection(
      `${zone.emoji} *${zone.name}* [${zone.ring}]\n\n` +
        `${zone.isActive ? '🟢 Active' : '🔴 Inactive'}\n\n` +
        `${
          zone.isArchived
            ? ":github-changes-requested: *Archived* (won't show up on games)"
            : `${APPROVE_SIGN} *Not Archived* (will show up on games)`
        }`
    )
  );

  const actionsSection: SlackBlockKitActionLayout[] = zones.map((zone) => ({
    type: 'actions',
    elements: [
      blockKitButton('Edit', `${ARENA_SECONDARY_ACTIONS.UPDATE_ZONE}-${zone.id}`),
      blockKitButton(
        'Delete',
        `${ARENA_SECONDARY_ACTIONS.DELETE_ZONE}-${zone.id}`,
        blockKitConfirmDialog({
          title: 'Delete Zone',
          mainText: `Are you sure you want to *delete* ${zone.emoji} ${zone.name}?`,
          confirmText: `Yes, delete ${zone.name}`,
          denyText: 'No, take me back',
        }),
        'danger'
      ),
    ],
  }));

  const zonesActionsSection = [] as SlackBlockKitSectionLayout[] & SlackBlockKitActionLayout[];
  zonesSection.forEach((zone, index) => {
    zonesActionsSection.push(zone);
    zonesActionsSection.push(actionsSection[index]);
  });

  return [mainTitleContextLayout, blockKitDivider, ...zonesActionsSection, blockKitDivider];
}

export function generateArenaZoneModal(zone?: ArenaZone): SlackDialog {
  const blockKitDivider: SlackBlockKitDividerLayout = {
    type: 'divider',
  };
  const callbackId = ARENA_SECONDARY_ACTIONS.CREATE_OR_UPDATE_ZONE_DATA;
  const blocks: SlackBlockKitLayoutElement[] = [
    blockKitDivider,
    {
      type: 'input',
      block_id: `${callbackId}-name`,
      label: blockKitCompositionText('Zone Name'),
      dispatch_action: false,
      element: blockKitInputText(
        `${callbackId}-name-action`,
        'Please provide a name for this zone',
        zone?.name
      ),
      optional: false,
    },
    {
      type: 'input',
      block_id: `${callbackId}-emoji`,
      label: blockKitCompositionText('Emoji'),
      dispatch_action: false,
      element: blockKitInputText(
        `${callbackId}-emoji-action`,
        'Please provide an emoji for this zone',
        zone?.emoji
      ),
    },
    {
      type: 'input',
      block_id: `${callbackId}-code`,
      label: blockKitCompositionText('Code (Arena Ring)'),
      dispatch_action: false,
      element: blockKitSelectMenu(
        `${callbackId}-code-action`,
        'Please select one :point_right:',
        Object.values(ARENA_ZONE_RING).map((code) => blockKitCompositionOption(code, code)),
        zone ? blockKitCompositionOption(zone.ring, zone.ring) : undefined
      ),
      optional: false,
    },
    blockKitInputField({
      blockId: `${callbackId}-is-archived`,
      labelText: `Is this zone archived (won't show up on games by default)?`,
      element: blockKitSelectMenu(
        `${callbackId}-is-archived-action`,
        'Please select one :point_right:',
        [blockKitCompositionOption('False', 'false'), blockKitCompositionOption('True', 'true')],
        zone
          ? blockKitCompositionOption(
              `${zone.isArchived ? 'True' : 'False'}`,
              `${zone.isArchived ? 'true' : 'false'}`
            )
          : blockKitCompositionOption('False', 'false')
      ),
      optional: false,
    }),
    blockKitDivider,
  ];

  return blockKitDialogObject({
    type: 'modal',
    submit: blockKitCompositionText('Send'),
    title: blockKitCompositionText('Zone Setup'),
    callback_id: callbackId,
    blocks,
  });
}
