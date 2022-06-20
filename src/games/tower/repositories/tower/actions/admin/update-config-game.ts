import type { User } from '../../../../../../models';
import { findActiveTowerGame } from '../../../../../../models/TowerGame';
import type { TowerFormData } from '../../../../../model/SlackDialogObject';
import { adminAction, getGameError, getGameResponse } from '../../../../../utils';
import { generateUpdateTowerDialogView } from '../../../../generators/info-setup-and-config';
import { theTowerNotifyEphemeral, theTowerOpenView, withTowerTransaction } from '../../../../utils';
import { towerCommandReply } from '../../replies';

export async function updateTowerBasicInfo(userRequesting: User, triggerId = '', towerId: number) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const towerFound = await findActiveTowerGame(transaction);
    if (towerFound?.id !== towerId) {
      return getGameError(towerCommandReply.cannotUpdateTower());
    }
    const dialogView = generateUpdateTowerDialogView(towerFound);
    await theTowerOpenView({
      trigger_id: triggerId,
      view: dialogView,
    });
    return getGameResponse(towerCommandReply.commandFinished('Update Tower Info'));
  });
}

export async function updateTowerBasicInfoForm(userRequesting: User, towerGameInfo: TowerFormData) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const {
      [`tower-update-name-block`]: {
        [`tower-update-name-action`]: { value: nameProvided },
      },
      [`tower-update-luna-prize-block`]: {
        [`tower-update-luna-prize-action`]: { value: lunaPrizeProvided },
      },
      [`tower-update-coin-prize-block`]: {
        [`tower-update-coin-prize-action`]: { value: coinPrizeProvided },
      },
    } = towerGameInfo;
    if (!nameProvided || !lunaPrizeProvided || !coinPrizeProvided) {
      return getGameError(towerCommandReply.requiredTowerFormDataEmpy());
    }
    const lunaPrizeParsed = parseInt(lunaPrizeProvided, 10);
    const coinPrizeParsed = parseInt(coinPrizeProvided, 10);
    const towerGameFound = await findActiveTowerGame(transaction);
    if (!towerGameFound) {
      return getGameError(towerCommandReply.cannotUpdateTower());
    }
    await towerGameFound.updateGame({ name: nameProvided }, transaction);
    await towerGameFound._tower?.updateTowerGame(
      { lunaPrize: lunaPrizeParsed, coinPrize: coinPrizeParsed },
      transaction
    );
    await theTowerNotifyEphemeral(
      towerCommandReply.commandFinished('Update Tower Info'),
      userRequesting.slackId!,
      userRequesting.slackId!
    );
    return getGameResponse(towerCommandReply.commandFinished('Update Tower Info Form'));
  });
}
