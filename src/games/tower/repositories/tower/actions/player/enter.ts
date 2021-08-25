import { Game, User } from '../../../../../../models';
import { createBattlefield } from '../../../../../../models/TowerFloorBattlefield';
import { addTowerFloorBattlefieldEnemies } from '../../../../../../models/TowerFloorBattlefieldEnemy';
import {
  addTowerFloorBattlefieldUsers,
  findRaiderByUser,
} from '../../../../../../models/TowerRaider';
import { startRound } from '../../../../../../models/TowerRound';
import { findOrCreateTowerStatistics } from '../../../../../../models/TowerStatistics';
import { ONE, ZERO } from '../../../../../consts/global';
import { GameResponse, getGameResponse } from '../../../../../utils';
import { generateTowerActionsBlockKit } from '../../../../generators/gameplay';
import {
  activeTowerHandler,
  publishTowerPublicMessage,
  theTowerNotifyEphemeral,
  theTowerNotifyInPrivate,
  towerGatesHandler,
  withTowerTransaction,
} from '../../../../utils';
import { towerCommandReply } from '../../replies';

export async function enterTheTower(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const towerGates = await towerGatesHandler(activeTower);
    if (towerGates !== true) {
      return towerGates as GameResponse;
    }
    await findOrCreateTowerStatistics(
      activeTower._tower?.id ?? ZERO,
      userRequesting.id,
      transaction
    );
    const raider = await findRaiderByUser(userRequesting.id, true, transaction);
    if (raider?._towerFloorBattlefieldId) {
      const raidersTowerFloor = activeTower._tower?.findRaiderInTower(raider);
      if (raidersTowerFloor) {
        await theTowerNotifyInPrivate(
          towerCommandReply.raiderAlreadyInTheTower(raidersTowerFloor),
          userRequesting.slackId!
        );
        return getGameResponse(towerCommandReply.commandFinished('Enter The Tower'));
      }
    }
    const firstFloor = activeTower._tower?._floors?.find((floor) => floor.number === ONE)!;
    const newBattlefield = await createBattlefield(firstFloor.id, transaction);
    const [raiderAdded] = await addTowerFloorBattlefieldUsers(
      newBattlefield.id,
      [userRequesting],
      transaction
    );
    await addTowerFloorBattlefieldEnemies(
      newBattlefield.id,
      firstFloor._floorEnemies ?? [],
      transaction
    );
    await startRound(
      newBattlefield.id,
      userRequesting.id,
      firstFloor.isEveryoneVisible,
      transaction
    );
    await publishTowerPublicMessage(
      towerCommandReply.channelRaiderEntersTheTower(userRequesting.slackId!)
    );
    const towerEnemies =
      firstFloor._floorEnemies?.map((floorEnemies) => floorEnemies._enemy!) ?? [];
    const starterWeapon = raiderAdded._weapons ? raiderAdded._weapons[ZERO] : undefined;
    await theTowerNotifyInPrivate(
      `${towerCommandReply.welcomeToTheTower(starterWeapon)}\n` +
        `${towerCommandReply.enemiesGifs(towerEnemies)}`,
      userRequesting.slackId!
    );
    const hud = towerCommandReply.raiderHUD(raiderAdded);
    const actionBlockkit = generateTowerActionsBlockKit(hud);
    await theTowerNotifyEphemeral(
      '',
      raiderAdded._user?.slackId!,
      raiderAdded._user?.slackId!,
      actionBlockkit
    );
    return getGameResponse(towerCommandReply.commandFinished('Enter The Tower'));
  });
}
