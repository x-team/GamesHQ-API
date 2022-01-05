import { Game, User } from '../../../../../../models';
import { findAllEnemies, findEnemyById } from '../../../../../../models/Enemy';
import { findTowerFloorById } from '../../../../../../models/TowerFloor';
import {
  findFloorBattlefieldEnemiesByFloorEnemy,
  removeEnemyFromFloorBattlefields,
} from '../../../../../../models/TowerFloorBattlefieldEnemy';
import {
  addTowerFloorEnemies,
  addTowerFloorEnemy,
  findTowerFloorEnemyById,
} from '../../../../../../models/TowerFloorEnemy';
import { removeActionsByFloorBattlefieldEnemy } from '../../../../../../models/TowerRoundAction';
import { TEN } from '../../../../../consts/global';
import { SlackBlockKitLayoutElement } from '../../../../../model/SlackBlockKit';
import { adminAction, GameResponse, getGameError, getGameResponse } from '../../../../../utils';
import { TOWER_FLOOR_HIDING, TOWER_SECONDARY_SLACK_ACTIONS } from '../../../../consts';
import {
  generateFloorEnemyAmountPickerBlock,
  generateFloorEnemyPickerBlock,
  generateTowerFloorSpecs,
  generateTowerValidationQuestionSection,
} from '../../../../generators/floors-and-enemies';
import { activeTowerHandler, withTowerTransaction } from '../../../../utils';
import { towerCommandReply } from '../../replies';

// FLOORS /////////////////////////////////////////////////////////////////////////////////

export async function setFloorById(userRequesting: User, floorId: number) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const floor = await findTowerFloorById(floorId, false, transaction);
    if (!floor) {
      return getGameError(towerCommandReply.floorNotFound());
    }
    const floorSpecs = generateTowerFloorSpecs(floor);
    return getGameResponse(floorSpecs);
  });
}

export async function setFloorVisibility(
  userRequesting: User,
  hiding: TOWER_FLOOR_HIDING,
  floorId: number
) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const floor = await findTowerFloorById(floorId, false, transaction);
    if (!floor) {
      return getGameError(towerCommandReply.floorNotFound());
    }
    const isEveryoneVisible = hiding === TOWER_FLOOR_HIDING.ENABLE ? false : true;
    await floor.setVisibility(isEveryoneVisible, transaction);
    return getGameResponse(towerCommandReply.setTowerFloorEnemiesFinished());
  });
}

// FLOORS ENEMIES /////////////////////////////////////////////////////////////////////////////////

export async function setFloorEnemies(userRequesting: User, floorNumber?: number) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    let mutableSlackBlocks: SlackBlockKitLayoutElement[];
    const availableEnemies = await findAllEnemies(transaction);
    if (floorNumber) {
      mutableSlackBlocks = generateFloorEnemyPickerBlock(
        towerCommandReply.adminSetFloor(floorNumber),
        availableEnemies,
        `${TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR}-${floorNumber}`
      );
    } else {
      const lastFloorSet = activeTower._tower?._floors?.find(
        (floor) => floor._floorEnemies?.length === 0
      );
      const lastFloorNumber = lastFloorSet?.number;
      if (lastFloorNumber === undefined) {
        return getGameResponse(towerCommandReply.adminTowerSetCompleted(activeTower.name));
      }
      mutableSlackBlocks = generateFloorEnemyPickerBlock(
        towerCommandReply.adminSetFloor(lastFloorNumber),
        availableEnemies,
        `${TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_TO_TOWER_FLOOR}-${lastFloorNumber}`
      );
    }
    return getGameResponse(mutableSlackBlocks);
  });
}

export async function removeEnemyFromFloor(userRequesting: User, towerEnemyId: number) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const towerFloorEnemy = await findTowerFloorEnemyById(towerEnemyId, transaction);
    if (!towerFloorEnemy) {
      return getGameError(towerCommandReply.enemyNotFound());
    }
    const battlefieldEnemies = await findFloorBattlefieldEnemiesByFloorEnemy(
      towerFloorEnemy.id,
      transaction
    );
    await Promise.all(
      battlefieldEnemies.map((battlefieldEnemy) =>
        removeActionsByFloorBattlefieldEnemy(battlefieldEnemy.id, transaction)
      )
    );
    await removeEnemyFromFloorBattlefields(towerFloorEnemy.id, transaction);
    await towerFloorEnemy.destroy({ transaction });
    return getGameResponse(towerCommandReply.setTowerFloorEnemiesFinished());
  });
}

export async function addEnemiesToFloor(
  userRequesting: User,
  floorNumber: number,
  enemyIds: number[]
) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const towerFloor = activeTower._tower?._floors?.find((floor) => floor.number === floorNumber);
    if (!towerFloor) {
      return getGameError(towerCommandReply.floorNumberNotValid());
    }
    await addTowerFloorEnemies(towerFloor.id, enemyIds, transaction);
    return;
  });
}

export async function addEnemyToFloor(userRequesting: User, floorNumber: number, enemyId: number) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const towerFloor = activeTower._tower?._floors?.find((floor) => floor.number === floorNumber);
    if (!towerFloor) {
      return getGameError(towerCommandReply.floorNumberNotValid());
    }
    const enemy = await findEnemyById(enemyId, transaction);
    if (!enemy) {
      return getGameError(towerCommandReply.floorNumberNotValid());
    }
    await addTowerFloorEnemy(towerFloor.id, enemy, transaction);
    const slackBlocks = generateFloorEnemyAmountPickerBlock(
      towerCommandReply.adminSetFloor(towerFloor.number),
      towerFloor.number,
      enemy,
      `${TOWER_SECONDARY_SLACK_ACTIONS.ADD_ENEMY_AMOUNT_TO_TOWER_FLOOR}-${enemy.id}`
    );
    return getGameResponse(slackBlocks);
  });
}

export async function addEnemyAmountToFloor(
  userRequesting: User,
  enemyId: number,
  floorAndAmount: string
) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    const [floorNumberString, amountString] = floorAndAmount.split('-');
    const floorNumber = parseInt(floorNumberString, TEN);
    const enemyAmount = parseInt(amountString, TEN);
    if (isNaN(floorNumber) || isNaN(enemyAmount)) {
      return getGameError(towerCommandReply.floorNumberNotValid());
    }
    const towerFloor = activeTower._tower?._floors?.find((floor) => floor.number === floorNumber);
    if (!towerFloor) {
      return getGameError(towerCommandReply.floorNumberNotValid());
    }
    const enemy = await findEnemyById(enemyId, transaction);
    if (!enemy) {
      return getGameError(towerCommandReply.floorNumberNotValid());
    }
    if (enemyAmount > 1) {
      for (let mutableI = 2; mutableI <= enemyAmount; mutableI++) {
        await addTowerFloorEnemy(towerFloor.id, enemy, transaction);
      }
    }
    const slackBlocks = generateTowerValidationQuestionSection(
      towerCommandReply.adminSetFloor(towerFloor.number),
      towerFloor.number
    );
    return getGameResponse(slackBlocks);
  });
}

export async function finishTowerFloorEnemyAddition(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(towerCommandReply.adminsOnly());
    }
    const activeTower = await activeTowerHandler(transaction);
    if (!(activeTower instanceof Game)) {
      return activeTower as GameResponse;
    }
    return getGameResponse(towerCommandReply.setTowerFloorEnemiesFinished());
  });
}
