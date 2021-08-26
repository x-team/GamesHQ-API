import { User } from '../../../../models';
import { TowerFormData } from '../../../model/SlackDialogObject';
import { GameResponse } from '../../../utils';
import { TOWER_FLOOR_HIDING } from '../../consts';
import {
  askEndGame,
  cancelEndGame,
  displayScoreboard,
  displayTowerInfo,
  endGame,
  newGame,
  openOrCloseTowerGates,
} from './actions/admin/create-or-finish-game';
import {
  addEnemyAmountToFloor,
  addEnemyToFloor,
  finishTowerFloorEnemyAddition,
  removeEnemyFromFloor,
  setFloorById,
  setFloorEnemies,
  setFloorVisibility,
} from './actions/admin/tower-floors-operations';
import { updateTowerBasicInfo, updateTowerBasicInfoForm } from './actions/admin/update-config-game';
import { enterTheTower } from './actions/player/enter';
import type { TowerEngine } from './engine';

interface TowerRepositoryMethods {
  /////////////////////////////////////////////////////////////////// PLAYER ///////////////////////////////////////////////////////////////////

  // PLAYERS: ENTER AND EXIT OPERATIONS ///////////////////////////////////////
  enterTheTower(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: MENU OPERATIONS ///////////////////////////////////////

  // PLAYERS: HIDE OPERATIONS ///////////////////////////////////////////////////////////////////

  // PLAYERS: SEARCH OPERATIONS ///////////////////////////////////////////////

  // PLAYERS: HEAL OR REVIVE OPERATIONS ///////////////////////////////////////

  // PLAYERS: HUNT OPERATIONS /////////////////////////////////////////////////

  // PLAYERS: CHEER OPERATIONS /////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////// ADMIN ///////////////////////////////////////////////////////////////////

  // ADMIN: CREATE AND SETUP OPERATIONS ////////////////////////////////////////////
  newGame(commandText: string, userRequesting: User): Promise<GameResponse>;
  askEndGame(userRequesting: User): Promise<GameResponse>;
  endGame(userRequesting: User): Promise<GameResponse>;
  cancelEndGame(userRequesting: User): Promise<GameResponse>;
  openOrCloseTowerGates(userRequesting: User, isOpen: boolean): Promise<GameResponse>;
  displayTowerInfo(userRequesting: User): Promise<GameResponse>;
  updateTowerBasicInfo(
    userRequesting: User,
    triggerId: string,
    towerId: number
  ): Promise<GameResponse>;
  updateTowerBasicInfoForm(
    userRequesting: User,
    towerGameInfo: TowerFormData
  ): Promise<GameResponse>;

  // ADMIN: FLOORS OPERATIONS ////////////////////////////////////////////
  setFloorById(userRequesting: User, floorId: number): Promise<GameResponse>;
  setFloorVisibility(
    userRequesting: User,
    hiding: TOWER_FLOOR_HIDING,
    floorId: number
  ): Promise<GameResponse>;
  setFloorEnemies(userRequesting: User, floorNumber?: number): Promise<GameResponse>;
  removeEnemyFromFloor(userRequesting: User, towerEnemyId: number): Promise<GameResponse>;
  addEnemyToFloor(
    userRequesting: User,
    floorNumber: number,
    enemyId: number
  ): Promise<GameResponse>;
  addEnemyAmountToFloor(
    userRequesting: User,
    enemyId: number,
    floorAndAmount: string
  ): Promise<GameResponse>;
  finishTowerFloorEnemyAddition(userRequesting: User): Promise<GameResponse>;

  // ADMIN: LIST OPERATIONS ////////////////////////////////////////////
  displayScoreboard(userRequesting: User): Promise<GameResponse>;

  // ADMIN: VISIBILITY OPERATIONS ////////////////////////////////////////////

  // ADMIN: PERFORMANCE OPERATIONS ////////////////////////////////////////////

  // ADMIN: ROUND OPERATIONS /////////////////////////////////////////////////
}

export class TowerRepository implements TowerRepositoryMethods {
  constructor(public towerGameEngine: TowerEngine) {}

  /////////////////////////////////////////////////////////////////// PLAYER ///////////////////////////////////////////////////////////////////

  // PLAYERS: ENTER AND EXIT OPERATIONS ///////////////////////////////////////
  public enterTheTower = enterTheTower.bind(this);

  // PLAYERS: MENU OPERATIONS ///////////////////////////////////////

  // PLAYERS: HIDE OPERATIONS ///////////////////////////////////////////////////////////////////

  // PLAYERS: SEARCH OPERATIONS ///////////////////////////////////////////////////////////////////

  // PLAYERS: HEAL OR REVIVE OPERATIONS ///////////////////////////////////////////////////////////////////

  // PLAYERS: HUNT OPERATIONS ///////////////////////////////////////////////////////////////////

  // PLAYERS: CHEER OPERATIONS /////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////// ADMIN ///////////////////////////////////////////////////////////////////

  // ADMIN: CREATE AND SETUP OPERATIONS ///////////////////////////////////////////////////////////////////
  public newGame = newGame.bind(this);
  public askEndGame = askEndGame.bind(this);
  public endGame = endGame.bind(this);
  public cancelEndGame = cancelEndGame.bind(this);
  public openOrCloseTowerGates = openOrCloseTowerGates.bind(this);
  public displayTowerInfo = displayTowerInfo.bind(this);
  public updateTowerBasicInfo = updateTowerBasicInfo.bind(this);
  public updateTowerBasicInfoForm = updateTowerBasicInfoForm.bind(this);

  // ADMIN: FLOORS OPERATIONS ///////////////////////////////////////////////////////////////////
  public setFloorById = setFloorById.bind(this);
  public setFloorVisibility = setFloorVisibility.bind(this);
  public setFloorEnemies = setFloorEnemies.bind(this);
  public removeEnemyFromFloor = removeEnemyFromFloor.bind(this);
  public addEnemyToFloor = addEnemyToFloor.bind(this);
  public addEnemyAmountToFloor = addEnemyAmountToFloor.bind(this);
  public finishTowerFloorEnemyAddition = finishTowerFloorEnemyAddition.bind(this);

  // ADMIN: LIST OPERATIONS ////////////////////////////////////////////
  public displayScoreboard = displayScoreboard.bind(this);

  // ADMIN: WEAPONS OPERATIONS ////////////////////////////////////////////

  // ADMIN: PERFORMANCE OPERATIONS ////////////////////////////////////////////

  // ADMIN: ROUND OPERATIONS /////////////////////////////////////////////////
}
