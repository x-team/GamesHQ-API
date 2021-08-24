import { Game, User } from '../../../../../../models';
import { startTowerGame } from '../../../../../../models/TowerGame';
import { findActiveRound } from '../../../../../../models/TowerRound';
import { adminAction, GameResponse, getGameError, getGameResponse } from '../../../../../utils';
import { generateTowerEndGameConfirmationBlockKit } from '../../../../generators/gameplay';
import {
  activeTowerHandler,
  parseCreateTowerCommandText,
  publishTowerPublicMessage,
  withTowerTransaction,
} from '../../../../utils';
import { leaveTower } from '../../../../utils/leave-tower';
import { towerCommandReply } from '../../replies';

export async function newGame(commandText: string, userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const parsedCommandText = parseCreateTowerCommandText(commandText);
    const game = await startTowerGame(
      {
        name: parsedCommandText.name,
        height: parsedCommandText.height,
        lunaPrize: parsedCommandText.lunaPrize,
        coinPrize: parsedCommandText.coinPrize,
        _createdById: userRequesting.id,
        isOpen: false,
      },
      transaction
    );
    return getGameResponse(towerCommandReply.adminCreatedGame(game));
  });
}

export async function askEndGame(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const endGameConfirmBlock = generateTowerEndGameConfirmationBlockKit();
    return getGameResponse(endGameConfirmBlock);
  });
}

export async function endGame(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const allRaiderInsideTheTower =
      (await activeTower._tower?.findAllRaidersInside(transaction)) ?? [];
    await Promise.all(
      allRaiderInsideTheTower.map(async (raider) => {
        const activeRound = await findActiveRound(
          raider._towerFloorBattlefieldId!,
          false,
          transaction
        );
        await leaveTower({ raider, round: activeRound }, transaction);
      })
    );
    await activeTower.endGame(transaction);
    await publishTowerPublicMessage(towerCommandReply.channelEndGame(activeTower));
    return getGameResponse(towerCommandReply.adminEndedGame(activeTower));
  });
}

export async function cancelEndGame(userRequesting: User) {
  return withTowerTransaction(async () => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    return getGameResponse(towerCommandReply.cancelEndGame());
  });
}
