import type { User } from '../../../../models';
import type { GameResponse } from '../../../utils';
import {
  addBossOrGuestCommand,
  addPlayerCommand,
  addSpectatorCommand,
} from './actions/admin/add-players';
import {
  askEndGame,
  cancelEndGame,
  endGame,
  newGame,
  toggleZoneDeactivationSystem,
} from './actions/admin/create-or-finish-game';
import { listIdlePlayers, listPlayers, listSpectators } from './actions/admin/list-players';
import { makeAllVisible } from './actions/admin/make-all-visible';
import { performance } from './actions/admin/performance';
import { reviveBoss } from './actions/admin/revive-boss';
import { startRoundCommand } from './actions/admin/start-round';
import {
  confirmNarrowWeapons,
  giveEveryoneWeapon,
  selectWeaponForEveryone,
  startNarrowWeaponsQuestion,
} from './actions/admin/weapons';
import { bossChangeLocation, changeLocation } from './actions/player/change-location';
import { cheer, completeCheer, repeatLastCheer } from './actions/player/cheer';
import { hide } from './actions/player/hide';
import { chooseTarget, chooseWeapon, hunt } from './actions/player/hunt';
import { actionsMenu, status } from './actions/player/menu';
import { completeRevive, reviveOther, reviveSelf } from './actions/player/revive';
import { searchForArmors, searchForHealth, searchForWeapons } from './actions/player/search';

import type { ArenaEngine } from './engine';

interface ArenaRepositoryMethods {
  /////////////////////////////////////////////////////////////////// PLAYER ///////////////////////////////////////////////////////////////////

  // PLAYERS: CHANGE LOCATION OPERATIONS ///////////////////////////////////////
  changeLocation(userRequesting: User, arenaZoneId: number): Promise<GameResponse>;
  bossChangeLocation(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: MENU OPERATIONS ///////////////////////////////////////
  actionsMenu(userRequesting: User): Promise<GameResponse>;
  status(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: HIDE OPERATIONS ///////////////////////////////////////////////////////////////////
  hide(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: SEARCH OPERATIONS ///////////////////////////////////////////////
  searchForWeapons(userRequesting: User): Promise<GameResponse>;
  searchForArmors(userRequesting: User): Promise<GameResponse>;
  searchForHealth(userRequesting: User): Promise<GameResponse>;

  // PLAYERS: HEAL OR REVIVE OPERATIONS ///////////////////////////////////////
  reviveSelf(userRequesting: User): Promise<GameResponse>;
  reviveOther(userRequesting: User): Promise<GameResponse>;
  completeRevive(userRequesting: User, selectedTargetId: number): Promise<GameResponse>;

  // PLAYERS: HUNT OPERATIONS /////////////////////////////////////////////////
  hunt(userRequesting: User): Promise<GameResponse>;
  chooseWeapon(userRequesting: User, selectedWeapon: number, action: string): Promise<GameResponse>;
  chooseTarget(userRequesting: User, selectedTargetId: number): Promise<GameResponse>;

  // PLAYERS: CHEER OPERATIONS /////////////////////////////////////////////////
  cheer(userRequesting: User): Promise<GameResponse>;
  repeatLastCheer(userRequesting: User): Promise<GameResponse>;
  completeCheer(userRequesting: User, selectedTargetId: number): Promise<GameResponse>;

  /////////////////////////////////////////////////////////////////// ADMIN ///////////////////////////////////////////////////////////////////

  // ADMIN: CREATE AND SETUP OPERATIONS ////////////////////////////////////////////
  newGame(commandText: string, userRequesting: User): Promise<GameResponse>;
  askEndGame(userRequesting: User): Promise<GameResponse>;
  endGame(userRequesting: User): Promise<GameResponse>;
  cancelEndGame(userRequesting: User): Promise<GameResponse>;
  toggleZoneDeactivationSystem(userRequesting: User, isEnable: boolean): Promise<GameResponse>;

  // ADMIN: ADD PLAYER OPERATIONS ////////////////////////////////////////////
  addPlayerCommand(
    commandText: string,
    userRequesting: User,
    channelId: string
  ): Promise<GameResponse>;
  addSpectatorCommand(
    commandText: string,
    userRequesting: User,
    channelId: string
  ): Promise<GameResponse>;
  addBossOrGuestCommand(
    commandText: string,
    userRequesting: User,
    isBoss: boolean
  ): Promise<GameResponse>;

  // ADMIN: WEAPONS OPERATIONS ////////////////////////////////////////////
  reviveBoss(commandText: string, userRequesting: User): Promise<GameResponse>;

  // ADMIN: WEAPONS OPERATIONS ////////////////////////////////////////////
  selectWeaponForEveryone(userRequesting: User): Promise<GameResponse>;
  giveEveryoneWeapon(userRequesting: User, selectedWeapon: number): Promise<GameResponse>;
  startNarrowWeaponsQuestion(userRequesting: User): Promise<GameResponse>;
  confirmNarrowWeapons(userRequesting: User, selectedIds: number[]): Promise<GameResponse>;

  // ADMIN: LIST OPERATIONS ////////////////////////////////////////////
  listPlayers(userRequesting: User): Promise<GameResponse>;
  listSpectators(userRequesting: User): Promise<GameResponse>;
  listIdlePlayers(userRequesting: User): Promise<GameResponse>;

  // ADMIN: VISIBILITY OPERATIONS ////////////////////////////////////////////
  makeAllVisible(channelId: string, userRequesting: User): Promise<GameResponse>;

  // ADMIN: PERFORMANCE OPERATIONS ////////////////////////////////////////////
  performance(userRequesting: User): Promise<GameResponse>;

  // ADMIN: ROUND OPERATIONS /////////////////////////////////////////////////
  startRound(userRequesting: User): Promise<GameResponse>;
}

export class ArenaRepository implements ArenaRepositoryMethods {
  constructor(public arenaGameEngine: ArenaEngine) {}

  /////////////////////////////////////////////////////////////////// PLAYER ///////////////////////////////////////////////////////////////////

  // PLAYERS: CHANGE LOCATION OPERATIONS ///////////////////////////////////////
  public changeLocation = changeLocation.bind(this);
  public bossChangeLocation = bossChangeLocation.bind(this);

  // PLAYERS: MENU OPERATIONS ///////////////////////////////////////
  public actionsMenu = actionsMenu.bind(this);
  public status = status.bind(this);

  // PLAYERS: HIDE OPERATIONS ///////////////////////////////////////////////////////////////////
  public hide = hide.bind(this);

  // PLAYERS: SEARCH OPERATIONS ///////////////////////////////////////////////////////////////////
  public searchForWeapons = searchForWeapons.bind(this);
  public searchForArmors = searchForArmors.bind(this);
  public searchForHealth = searchForHealth.bind(this);

  // PLAYERS: HEAL OR REVIVE OPERATIONS ///////////////////////////////////////////////////////////////////
  public reviveSelf = reviveSelf.bind(this);
  public reviveOther = reviveOther.bind(this);
  public completeRevive = completeRevive.bind(this);

  // PLAYERS: HUNT OPERATIONS ///////////////////////////////////////////////////////////////////
  public hunt = hunt.bind(this);
  public chooseWeapon = chooseWeapon.bind(this);
  public chooseTarget = chooseTarget.bind(this);

  // PLAYERS: CHEER OPERATIONS /////////////////////////////////////////////////
  public cheer = cheer.bind(this);
  public repeatLastCheer = repeatLastCheer.bind(this);
  public completeCheer = completeCheer.bind(this);

  /////////////////////////////////////////////////////////////////// ADMIN ///////////////////////////////////////////////////////////////////

  // ADMIN: CREATE AND SETUP OPERATIONS ///////////////////////////////////////////////////////////////////
  public newGame = newGame.bind(this);
  public askEndGame = askEndGame.bind(this);
  public endGame = endGame.bind(this);
  public cancelEndGame = cancelEndGame.bind(this);
  public toggleZoneDeactivationSystem = toggleZoneDeactivationSystem.bind(this);

  // ADMIN: ADD PLAYER OPERATIONS ///////////////////////////////////////////////////////////////////
  public addPlayerCommand = addPlayerCommand.bind(this);
  public addSpectatorCommand = addSpectatorCommand.bind(this);
  public addBossOrGuestCommand = addBossOrGuestCommand.bind(this);

  // ADMIN: HEAL OR REVIVE BOSS OPERATIONS ///////////////////////////////////////////////////////////////////
  public reviveBoss = reviveBoss.bind(this);

  // ADMIN: LIST OPERATIONS ////////////////////////////////////////////
  public listPlayers = listPlayers.bind(this);
  public listSpectators = listSpectators.bind(this);
  public listIdlePlayers = listIdlePlayers.bind(this);

  // ADMIN: VISIBILITY OPERATIONS ////////////////////////////////////////////
  public makeAllVisible = makeAllVisible.bind(this);

  // ADMIN: WEAPONS OPERATIONS ////////////////////////////////////////////
  public selectWeaponForEveryone = selectWeaponForEveryone.bind(this);
  public giveEveryoneWeapon = giveEveryoneWeapon.bind(this);
  public startNarrowWeaponsQuestion = startNarrowWeaponsQuestion.bind(this);
  public confirmNarrowWeapons = confirmNarrowWeapons.bind(this);

  // ADMIN: PERFORMANCE OPERATIONS ////////////////////////////////////////////
  public performance = performance.bind(this);

  // ADMIN: ROUND OPERATIONS /////////////////////////////////////////////////
  public startRound = startRoundCommand.bind(this);
}
