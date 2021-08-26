import { Game, User } from '../../../../../../models';
import { findRaiderByUser } from '../../../../../../models/TowerRaider';
import { findActiveRound } from '../../../../../../models/TowerRound';
import { GameResponse, getGameError, getGameResponse } from '../../../../../utils';
import { activeTowerHandler, towerGatesHandler, withTowerTransaction } from '../../../../utils';
import { leaveTower } from '../../../../utils/leave-tower';
import { towerCommandReply } from '../../replies';

export async function exitTheTower(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const towerGates = await towerGatesHandler(activeTower);
    if (towerGates !== true) {
      return towerGates as GameResponse;
    }
    const raider = await findRaiderByUser(userRequesting.id, true, transaction);
    if (!raider) {
      return getGameError(towerCommandReply.raiderNotInTheGame());
    }
    const activeRound = await findActiveRound(raider._towerFloorBattlefieldId!, false, transaction);
    await leaveTower({ raider, round: activeRound }, transaction);
    return getGameResponse(towerCommandReply.raiderExitTower());
  });
}
