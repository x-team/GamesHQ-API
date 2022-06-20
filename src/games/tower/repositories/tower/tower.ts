import type { User } from '../../../../models';
import type { TowerFormData } from '../../../model/SlackDialogObject';
import type { GameResponse } from '../../../utils';
import type { TOWER_FLOOR_HIDING } from '../../consts';

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
import { displayProgress, raiderActions } from './actions/player/actions-menu';
import { completeChoosePerkOrItem } from './actions/player/choose-perk-or-item';
import { enterTheTower } from './actions/player/enter';
import { exitTheTower } from './actions/player/exit';
import { hide } from './actions/player/hide';
import { chooseTarget, chooseWeapon, hunt } from './actions/player/hunt';
import { repeatLastAction } from './actions/player/repeat-last-action';
import { completeRevive, reviveOther, reviveSelf } from './actions/player/revive';
import { searchForArmors, searchForHealthkits, searchForWeapons } from './actions/player/search';
import { startRoundCommand } from './actions/player/start-round';
import type { TowerEngine } from './engine';

interface TowerRepositoryMethods {
  /////////////////////////////////////////////////////////////////// PLAYER ///////////////////////////////////////////////////////////////////

  // PLAYERS: ENTER AND EXIT OPERATIONS ///////////////////////////////////////
  enterTheTower(userRequesting: User): Promise<GameResponse>;
  exitTheTower(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: MENU OPERATIONS ///////////////////////////////////////
  raiderActions(userRequesting: User): Promise<GameResponse>;
  displayProgress(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: HIDE OPERATIONS ///////////////////////////////////////////////////////////////////
  hide(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: SEARCH OPERATIONS ///////////////////////////////////////////////
  searchForHealthkits(userRequesting: User): Promise<GameResponse>;
  searchForArmors(userRequesting: User): Promise<GameResponse>;
  searchForWeapons(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: HEAL OR REVIVE OPERATIONS ///////////////////////////////////////
  reviveSelf(userRequesting: User): Promise<GameResponse>;
  reviveOther(userRequesting: User): Promise<GameResponse>;
  completeRevive(userRequesting: User, selectedTargetId: number): Promise<GameResponse>;

  // PLAYERS: HUNT OPERATIONS /////////////////////////////////////////////////
  hunt(userRequesting: User): Promise<GameResponse>;
  chooseWeapon(userRequesting: User, selectedWeaponId: number): Promise<GameResponse>;
  chooseTarget(userRequesting: User, selectedTargetId: number): Promise<GameResponse>;

  // PLAYERS: REPEAT LAST ACTION OPERATION /////////////////////////////////////////////////
  repeatLastAction(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: START ROUND OPERATION /////////////////////////////////////////////////
  startRoundCommand(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: PERK OR ITEM OPERATIONS ///////////////////////////////////////////////////////////////////
  completeChoosePerkOrItem(
    userRequesting: User,
    perkOrHealthkitId: string | number,
    selection: string
  ): Promise<GameResponse>;
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
}

export class TowerRepository implements TowerRepositoryMethods {
  constructor(public towerGameEngine: TowerEngine) {}

  /////////////////////////////////////////////////////////////////// PLAYER ///////////////////////////////////////////////////////////////////

  // PLAYERS: ENTER AND EXIT OPERATIONS ///////////////////////////////////////
  public enterTheTower = enterTheTower.bind(this);
  public exitTheTower = exitTheTower.bind(this);

  // PLAYERS: MENU OPERATIONS ///////////////////////////////////////
  public raiderActions = raiderActions.bind(this);
  public displayProgress = displayProgress.bind(this);

  // PLAYERS: HIDE OPERATIONS ///////////////////////////////////////////////////////////////////
  public hide = hide.bind(this);

  // PLAYERS: SEARCH OPERATIONS ///////////////////////////////////////////////////////////////////
  public searchForHealthkits = searchForHealthkits.bind(this);
  public searchForArmors = searchForArmors.bind(this);
  public searchForWeapons = searchForWeapons.bind(this);

  // PLAYERS: HEAL OR REVIVE OPERATIONS ///////////////////////////////////////////////////////////////////
  public reviveSelf = reviveSelf.bind(this);
  public reviveOther = reviveOther.bind(this);
  public completeRevive = completeRevive.bind(this);

  // PLAYERS: HUNT OPERATIONS ///////////////////////////////////////////////////////////////////
  public hunt = hunt.bind(this);
  public chooseWeapon = chooseWeapon.bind(this);
  public chooseTarget = chooseTarget.bind(this);

  // PLAYERS: REPEAT LAST ACTION OPERATION /////////////////////////////////////////////////
  public repeatLastAction = repeatLastAction.bind(this);

  // PLAYERS: START ROUND OPERATION /////////////////////////////////////////////////
  public startRoundCommand = startRoundCommand.bind(this);

  // PLAYERS: PERK OR ITEM OPERATIONS ///////////////////////////////////////////////////////////////////
  public completeChoosePerkOrItem = completeChoosePerkOrItem.bind(this);

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
}
