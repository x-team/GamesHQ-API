import type { User } from '../../../../../../models';
import { findTowerFloorById } from '../../../../../../models/TowerFloor';
import { findEnemiesByFloorBattlefield } from '../../../../../../models/TowerFloorBattlefieldEnemy';
import type { GameResponse } from '../../../../../utils';
import { getGameResponse } from '../../../../../utils';
import { generateTowerActionsBlockKit } from '../../../../generators/gameplay';
import type { TowerRaiderInteraction } from '../../../../utils';
import { raiderActionsAlive, withTowerTransaction } from '../../../../utils';
import { towerCommandReply } from '../../replies';

export async function raiderActions(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider } = raiderActions as TowerRaiderInteraction;
    const hud = towerCommandReply.raiderHUD(raider);
    const actionBlockkit = generateTowerActionsBlockKit(hud);
    return getGameResponse(actionBlockkit);
  });
}

export async function displayProgress(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    const enemies = await findEnemiesByFloorBattlefield(
      round._towerFloorBattlefieldId,
      transaction
    );
    const towerFloor = (await findTowerFloorById(
      round._floorBattlefield?._towerFloorId!,
      true,
      transaction
    ))!;
    const hud = towerCommandReply.raiderHUD(raider);
    const actionBlockkit = generateTowerActionsBlockKit(
      hud,
      towerCommandReply.raiderFullProgress(raider, towerFloor, enemies)
    );
    return getGameResponse(actionBlockkit);
  });
}
