import moment from 'moment';
import { Game, TowerFloor } from '../../../models';
import { FULL_HEALTH_HEART_EMOJI } from '../../consts/emojis';
import {
  SlackBlockKitDividerLayout,
  SlackBlockKitLayoutElement,
  SlackBlockKitSectionLayout,
} from '../../model/SlackBlockKit';
import { SlackDialog } from '../../model/SlackDialogObject';
import {
  blockKitButton,
  blockKitCompositionText,
  blockKitContext,
  blockKitDialogObject,
  blockKitDivider,
  blockKitHeader,
  blockKitInputField,
  blockKitInputText,
  blockKitMrkdwnSection,
} from '../../utils/generators/slack';
import { TOWER_SECONDARY_SLACK_ACTIONS } from '../consts';

function towerFloorDetail(floor: TowerFloor) {
  return (
    `*FLOOR ${floor.number}* | _${
      floor.isEveryoneVisible ? `Raiders can't hide` : 'Raiders can hide'
    }_` +
    `\n${floor._floorEnemies
      ?.map(
        (floorEnemy) =>
          `\t${floorEnemy._enemy?.emoji} ` +
          `${floorEnemy._enemy?.name} ` +
          `( ${FULL_HEALTH_HEART_EMOJI} ${floorEnemy._enemy?.health} ) ${
            floorEnemy._enemy?.isBoss ? '*[Boss]*' : ''
          }`
      )
      .join('\n')}`
  );
}

export function generateTowerInformation(towerGame: Game) {
  const blockKitDividerSection = blockKitDivider();
  const parsedDate = moment.utc(towerGame.startedAt).format('MMMM Do YYYY, h:mm:ss a');
  // Block kit Titles and Subtitles (Main Sections)
  const mainTitleHeaderLayout = blockKitHeader(`${towerGame.name} information`);
  const floorTitleHeaderLayout = blockKitHeader(`Tower Floors`);
  const mainContextLayout = blockKitContext(
    `*${parsedDate}* |  _${towerGame.isActive ? 'Active' : 'Not Active'}_ ` +
      `| _${towerGame._tower?.isOpen ? 'Open' : 'Closed'}_  ` +
      `| _Created by <@${towerGame._createdBy?.slackId}>_`
  );
  // Sections
  const prizeSection = blockKitMrkdwnSection(
    `*BIG JACKPOT PRIZE*\n` +
      `\t *${towerGame._tower?.lunaPrize}* :x-luna:\n` +
      `\t *${towerGame._tower?.coinPrize}* :coin:\n`,
    blockKitButton('Edit', `${TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_ID}-${towerGame.id}`)
  );
  const floors = towerGame._tower?._floors || [];
  const floorsWithDividerSection: (SlackBlockKitSectionLayout | SlackBlockKitDividerLayout)[] = [];
  floors?.forEach((floor) => {
    const titleSection = blockKitMrkdwnSection(
      towerFloorDetail(floor),
      blockKitButton('Edit', `${TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_FLOOR_ID}-${floor.id}`)
    );
    floorsWithDividerSection.push(titleSection);
    floorsWithDividerSection.push(blockKitDividerSection);
  });

  return [
    blockKitDividerSection,
    mainTitleHeaderLayout,
    mainContextLayout,
    blockKitDividerSection,
    prizeSection,
    floorTitleHeaderLayout,
    blockKitDividerSection,
    ...floorsWithDividerSection,
  ];
}

export function generateUpdateTowerDialogView(towerGame: Game): SlackDialog {
  const blockKitDividerSection = blockKitDivider();
  const callbackId = TOWER_SECONDARY_SLACK_ACTIONS.UPDATE_TOWER_ID;
  const blocks: SlackBlockKitLayoutElement[] = [
    blockKitDividerSection,
    blockKitInputField({
      blockId: `${callbackId}-name-block`,
      labelText: 'Name',
      dispatchAction: false,
      element: blockKitInputText(
        `${callbackId}-name-action`,
        'Please provide a name',
        towerGame.name
      ),
      optional: false,
    }),
    blockKitInputField({
      blockId: `${callbackId}-luna-prize-block`,
      labelText: 'Luna Prize',
      dispatchAction: false,
      element: blockKitInputText(
        `${callbackId}-luna-prize-action`,
        'Please provide a luna prize amount',
        `${towerGame._tower?.lunaPrize}`
      ),
      optional: true,
    }),
    blockKitInputField({
      blockId: `${callbackId}-coin-prize-block`,
      labelText: 'Coin Prize',
      dispatchAction: false,
      element: blockKitInputText(
        `${callbackId}-coin-prize-action`,
        'Please provide a coin prize amount',
        `${towerGame._tower?.coinPrize}`
      ),
      optional: true,
    }),
    blockKitDividerSection,
  ];
  return blockKitDialogObject({
    type: 'modal',
    submit: blockKitCompositionText('Send'),
    title: blockKitCompositionText('The Tower Setup'),
    callback_id: callbackId,
    blocks,
  });
}
