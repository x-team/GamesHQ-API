import { defaultToAny } from '../../../utils/api';
import type {
  SlackBlockKitActionLayout,
  SlackBlockKitButtonElement,
  SlackBlockKitCompositionImage,
  SlackBlockKitCompositionOption,
  SlackBlockKitCompositionTextOnly,
  SlackBlockKitContextLayout,
  SlackBlockKitDividerLayout,
  SlackBlockKitHeaderLayout,
  SlackBlockKitInputLayout,
  SlackBlockKitInputTextElement,
  SlackBlockKitMultiSelectMenuElement,
  SlackBlockKitSectionLayout,
  SlackBlockKitSelectMenuElement,
  SlackConfirmDialog,
} from '../../model/SlackBlockKit';
import type { SlackDialog } from '../../model/SlackDialogObject';

export function blockKitCompositionText(displayText: string): SlackBlockKitCompositionTextOnly {
  return {
    type: 'plain_text',
    text: displayText,
    emoji: true,
  };
}

export function blockKitDivider(): SlackBlockKitDividerLayout {
  return {
    type: 'divider',
  };
}

export function blockKitInputField({
  blockId,
  labelText,
  dispatchAction = false,
  element,
  optional = false,
}: {
  blockId: string;
  labelText: string;
  dispatchAction?: boolean;
  element:
    | SlackBlockKitSelectMenuElement
    | SlackBlockKitInputTextElement
    | SlackBlockKitMultiSelectMenuElement;
  optional?: boolean;
}): SlackBlockKitInputLayout {
  return {
    type: 'input',
    block_id: blockId,
    label: blockKitCompositionText(labelText),
    dispatch_action: dispatchAction,
    element,
    optional,
  };
}

export function blockKitCompositionImage(
  imageUrl: string,
  altText: string
): SlackBlockKitCompositionImage {
  return {
    type: 'image',
    image_url: imageUrl,
    alt_text: altText,
  };
}
interface ConfirmDialogDisplayText {
  title: string;
  mainText: string;
  confirmText: string;
  denyText: string;
}
export function blockKitConfirmDialog({
  title,
  mainText,
  confirmText,
  denyText,
}: ConfirmDialogDisplayText): SlackConfirmDialog {
  return {
    title: {
      type: 'plain_text',
      text: title,
    },
    text: {
      type: 'plain_text',
      text: mainText,
    },
    confirm: {
      type: 'plain_text',
      text: confirmText,
    },
    deny: {
      type: 'plain_text',
      text: denyText,
    },
  };
}

export function blockKitButton(
  displayText: string,
  value: string,
  confirm?: SlackConfirmDialog,
  style?: 'primary' | 'danger',
  actionId?: string
): SlackBlockKitButtonElement {
  return {
    type: 'button',
    action_id: `${actionId ?? value}`,
    text: {
      type: 'plain_text',
      text: displayText,
      emoji: true,
    },
    style,
    value,
    confirm,
  };
}

export function blockKitAction(
  elements: Array<SlackBlockKitSelectMenuElement | SlackBlockKitButtonElement>
): SlackBlockKitActionLayout {
  return {
    type: 'actions',
    elements,
  };
}

export function blockKitContext(displayText: string): SlackBlockKitContextLayout {
  return {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: displayText,
      },
    ],
  };
}

export function blockKitMrkdwnSection(
  displayText: string,
  accessory?:
    | SlackBlockKitSelectMenuElement
    | SlackBlockKitButtonElement
    | SlackBlockKitCompositionImage
    | SlackBlockKitMultiSelectMenuElement
): SlackBlockKitSectionLayout {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: displayText,
    },
    accessory,
  };
}

export function blockKitMultiSelect(
  actionId: string,
  displayText: string,
  options: SlackBlockKitCompositionOption[],
  initialOptions?: any
): SlackBlockKitMultiSelectMenuElement {
  return {
    action_id: actionId,
    type: 'multi_static_select',
    placeholder: {
      type: 'plain_text',
      text: displayText,
    },
    options,
    ...(initialOptions && initialOptions.length && { initial_options: initialOptions }),
  };
}

export function blockKitHeader(displayText: string): SlackBlockKitHeaderLayout {
  return {
    type: 'header',
    text: {
      type: 'plain_text',
      text: displayText,
    },
  };
}

export function blockKitInputText(
  actionId: string,
  displayText: string,
  initialValue?: string,
  multiline?: boolean,
  minLength?: number,
  maxLength?: number
): SlackBlockKitInputTextElement {
  return {
    type: 'plain_text_input',
    action_id: actionId,
    placeholder: {
      type: 'plain_text',
      text: displayText,
      emoji: true,
    },
    initial_value: initialValue,
    multiline,
    min_length: minLength,
    max_length: maxLength,
  };
}

export function blockKitSelectMenu(
  actionId: string,
  displayText: string,
  options: SlackBlockKitCompositionOption[],
  initialOption?: SlackBlockKitCompositionOption
): SlackBlockKitSelectMenuElement {
  return {
    type: 'static_select',
    action_id: actionId,
    placeholder: {
      type: 'plain_text',
      text: displayText,
      emoji: true,
    },
    options,
    initial_option: initialOption,
  };
}

export function blockKitCompositionOption(
  displayText: string,
  value: string
): SlackBlockKitCompositionOption {
  return {
    text: {
      type: 'plain_text',
      text: displayText,
      emoji: true,
    },
    value,
  };
}

export function blockKitDialogObject(dialogObj: SlackDialog): SlackDialog {
  const viewModal: SlackDialog = {
    type: dialogObj.type,
    callback_id: dialogObj.callback_id,
    title: dialogObj.title,
    blocks: dialogObj.blocks,
  };
  viewModal.clear_on_close = defaultToAny(dialogObj.clear_on_close, viewModal.clear_on_close);
  viewModal.close = defaultToAny(dialogObj.close, viewModal.close);
  viewModal.external_id = defaultToAny(dialogObj.external_id, viewModal.external_id);
  viewModal.notify_on_close = defaultToAny(dialogObj.notify_on_close, viewModal.notify_on_close);
  viewModal.private_metadata = defaultToAny(dialogObj.private_metadata, viewModal.private_metadata);
  viewModal.submit = defaultToAny(dialogObj.submit, viewModal.submit);
  return viewModal;
}
