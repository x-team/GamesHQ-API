import type { ArenaZone } from '../../../models';
import { APPROVE_SIGN } from '../../consts/emojis';
import type {
  SlackBlockKitActionLayout,
  SlackBlockKitCompositionOption,
  SlackBlockKitLayoutElement,
  SlackBlockKitSectionLayout,
} from '../../model/SlackBlockKit';
import { SlackDialog } from '../../model/SlackDialogObject';
import {
  blockKitAction,
  blockKitButton,
  blockKitCompositionOption,
  blockKitCompositionText,
  blockKitConfirmDialog,
  blockKitContext,
  blockKitDialogObject,
  blockKitDivider,
  blockKitInputField,
  blockKitInputText,
  blockKitMrkdwnSection,
  blockKitMultiSelect,
  blockKitSelectMenu,
} from '../../utils/generators/slack';
import { ARENA_SECONDARY_ACTIONS, ARENA_ZONE_RING } from '../consts';

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
  const blockKitDividerSection = blockKitDivider();
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

  const actionsSection = zones.map((zone) =>
    blockKitAction([
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
    ])
  );

  const zonesActionsSection = [] as SlackBlockKitSectionLayout[] & SlackBlockKitActionLayout[];
  zonesSection.forEach((zone, index) => {
    zonesActionsSection.push(zone);
    zonesActionsSection.push(actionsSection[index]);
  });

  return [
    mainTitleContextLayout,
    blockKitDividerSection,
    ...zonesActionsSection,
    blockKitDividerSection,
  ];
}

export function generateArenaZoneModal(zone?: ArenaZone): SlackDialog {
  const blockKitDividerSection = blockKitDivider();
  const callbackId = ARENA_SECONDARY_ACTIONS.CREATE_OR_UPDATE_ZONE_DATA;
  const blocks: SlackBlockKitLayoutElement[] = [
    blockKitDividerSection,
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
    blockKitDividerSection,
  ];

  return blockKitDialogObject({
    type: 'modal',
    submit: blockKitCompositionText('Send'),
    title: blockKitCompositionText('Zone Setup'),
    callback_id: callbackId,
    blocks,
  });
}
