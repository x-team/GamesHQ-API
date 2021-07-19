import { isEmpty, sampleSize } from 'lodash';
import type { Transaction } from 'sequelize';

import type { Item, User } from '../../../../models';
import {
  findActiveArenaGame,
  findLastActiveArenaGame,
  startArenaGame,
} from '../../../../models/ArenaGame';
import {
  addArenaPlayers,
  addArenaPlayersToZones,
  ArenaPlayer,
  findLivingPlayersByGame,
  findPlayerByUser,
  findPlayersByGame,
  findSpectatorsByGame,
  getIdlePlayers,
  getOrCreateBossesOrGuests,
  removePlayersFromArenaZones,
  setAllPlayerVisibility,
} from '../../../../models/ArenaPlayer';
import {
  findFirstBlood,
  findPlayersPerformanceByAction,
  findSinglePlayerPerformance,
} from '../../../../models/ArenaPlayerPerformance';
import { ArenaRound, findActiveRound } from '../../../../models/ArenaRound';
import {
  findPlayerRoundAction,
  removeActionFromRound,
  setPlayerRoundAction,
} from '../../../../models/ArenaRoundAction';
import {
  activateAllArenaZones,
  ArenaZone,
  findActiveArenaZones,
  findArenaZoneById,
} from '../../../../models/ArenaZone';
import { disableItems, enableAllItems } from '../../../../models/GameItemAvailability';
import { listAllItems } from '../../../../models/Item';
import { findWeaponById, listActiveWeaponsByGameType } from '../../../../models/ItemWeapon';
import { getUserBySlackId } from '../../../../models/User';
import { parseEscapedSlackUserValues } from '../../../../utils/slack';
import { GAME_TYPE, ONE } from '../../../consts/global';
import { generateTeamEmoji } from '../../../helpers';
import type { GameResponse } from '../../../utils';
import {
  adminAction,
  generateRandomNameForGame,
  getGameError,
  getGameResponse,
  parseCommandTextToSlackIds,
} from '../../../utils';
import { generateGenericWeaponPickerBlock } from '../../../utils/generators/games';
import {
  ARENA_PLAYER_PERFORMANCE,
  MAX_BOSS_HEALTH,
  MAX_TOP_OUTSTANDING_PERFORMANCE,
  BOSS_HEALTHKIT_HEALING,
  ARENA_ACTIONS,
  ARENA_SECONDARY_ACTIONS,
} from '../../consts';
import {
  generateActionsBlockKit,
  generateArenaEndGameConfirmationBlockKit,
  generateNarrowWeaponsBlock,
} from '../../generators';
import {
  parseRevivePlayerCommandText,
  publishArenaMessage,
  topPlayerPerformance,
  withArenaTransaction,
} from '../../utils';
import { addPlayers, addSpectator, parseBossAndGuestCommandText } from '../../utils/addPlayer';

import type { ArenaEngine } from './engine';
import {
  arenaCommandReply,
  generatePlayerPerformanceActionHeader,
  notifyPlayersWhoWantedToHide,
  PLAYER_PERFORMANCE_HEADER,
} from './replies';

interface PlayerActionsDeadOrAlive {
  interfaceName: 'PlayerActionsDeadOrAlive' | 'PlayerActionsAlive';
  player: ArenaPlayer;
  round: ArenaRound;
  zone: ArenaZone | undefined;
}

export class ArenaRepository {
  static async playerActions(
    userRequesting: User,
    needsToBeAlive: boolean,
    transaction: Transaction
  ): Promise<GameResponse | PlayerActionsDeadOrAlive> {
    const round = await findActiveRound(false, transaction);

    if (!round) {
      return getGameError(arenaCommandReply.noActiveRound());
    }
    const player = await findPlayerByUser(round._gameId, userRequesting.id, true, transaction);

    if (!player) {
      return getGameError(arenaCommandReply.playerNotInTheGame());
    }

    if (needsToBeAlive && !player.isAlive()) {
      return getGameError(arenaCommandReply.playerCannotWhileDead(player));
    }

    const zone = player._zone;
    await zone?.reload({
      include: [
        {
          association: ArenaZone.associations._players,
          include: [
            {
              association: ArenaPlayer.associations._game,
              where: { isActive: true },
            },
          ],
        },
      ],
      transaction,
    });
    return {
      interfaceName: needsToBeAlive ? 'PlayerActionsDeadOrAlive' : 'PlayerActionsAlive',
      player,
      round,
      zone,
    };
  }

  constructor(public arenaGameEngine: ArenaEngine) {}

  // PLAYERS ///////////////////////////////////////////////////////////////////
  async changeLocation(userRequesting: User, arenaZoneId: number) {
    return withArenaTransaction(async (transaction) => {
      const playerActions = await ArenaRepository.playerActions(userRequesting, false, transaction);

      if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
        return playerActions as GameResponse;
      }

      const { zone, player, round } = playerActions as PlayerActionsDeadOrAlive;

      if (!zone) {
        return getGameError(arenaCommandReply.zoneNeeded());
      }

      const roundAction = await findPlayerRoundAction(player.id, round.id, transaction);
      const playerPerformance = await findSinglePlayerPerformance(
        player.id,
        round._gameId,
        transaction
      );
      const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

      if (!roundAction) {
        const actionBlockkit = generateActionsBlockKit(
          player,
          hud,
          arenaCommandReply.playerDoesntHaveAction()
        );
        return getGameResponse(actionBlockkit);
      }

      const actionJson = roundAction.actionJSON;
      const arenaZoneToMove = await findArenaZoneById(arenaZoneId, transaction);

      if (!arenaZoneToMove) {
        const actionBlockkit = generateActionsBlockKit(
          player,
          hud,
          arenaCommandReply.zoneNotFound()
        );
        return getGameResponse(actionBlockkit);
      }

      const playerWillMove = player._arenaZoneId !== arenaZoneToMove.id;
      if (playerWillMove) {
        await setPlayerRoundAction(
          player,
          round,
          { ...actionJson, locationId: arenaZoneId },
          transaction
        );
      }
      return getGameResponse(arenaCommandReply.playerLocation(playerWillMove, arenaZoneToMove));
    });
  }

  async bossChangeLocation(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const playerActions = await ArenaRepository.playerActions(userRequesting, false, transaction);

      if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
        return playerActions as GameResponse;
      }

      const { zone, player, round } = playerActions as PlayerActionsDeadOrAlive;

      if (!zone) {
        return getGameError(arenaCommandReply.zoneNeeded());
      }

      const playerPerformance = await findSinglePlayerPerformance(
        player.id,
        round._gameId,
        transaction
      );
      const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

      if (!player.isBoss) {
        const actionBlockkit = generateActionsBlockKit(
          player,
          hud,
          arenaCommandReply.playerNotABoss()
        );
        return getGameResponse(actionBlockkit);
      }

      await setPlayerRoundAction(
        player,
        round,
        { id: ARENA_ACTIONS.STAY_ON_LOCATION },
        transaction
      );

      const arenaZonesAvailable = await findActiveArenaZones(transaction);
      const changeLocationParams = {
        player,
        arenaZonesAvailable,
      };
      return getGameResponse(arenaCommandReply.bossChangesLocation(changeLocationParams));
    });
  }

  async actionsMenu(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const playerActions = await ArenaRepository.playerActions(userRequesting, false, transaction);

      if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
        return playerActions as GameResponse;
      }

      const { zone, player, round } = playerActions as PlayerActionsDeadOrAlive;

      if (!zone) {
        return getGameError(arenaCommandReply.zoneNeeded());
      }

      const playerPerformance = await findSinglePlayerPerformance(
        player.id,
        round._gameId,
        transaction
      );
      const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);
      return getGameResponse(generateActionsBlockKit(player, hud));
    });
  }

  async status(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const playerActions = await ArenaRepository.playerActions(userRequesting, false, transaction);

      if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
        return playerActions as GameResponse;
      }

      const { zone, player, round } = playerActions as PlayerActionsDeadOrAlive;

      if (!zone) {
        return getGameError(arenaCommandReply.zoneNeeded());
      }

      const playerPerformance = await findSinglePlayerPerformance(
        player.id,
        round._gameId,
        transaction
      );
      const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);
      const cheersReceived = playerPerformance?.cheersReceived ?? 0;
      return getGameResponse(
        generateActionsBlockKit(player, hud, arenaCommandReply.playerStatus(player, cheersReceived))
      );
    });
  }

  async searchForWeapons(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const playerActions = await ArenaRepository.playerActions(userRequesting, true, transaction);
      if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
        return playerActions as GameResponse;
      }
      const arenaZonesAvailable = await findActiveArenaZones(transaction);

      const { player, round } = playerActions as PlayerActionsDeadOrAlive;
      await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.SEARCH_WEAPONS }, transaction);

      return getGameResponse(
        arenaCommandReply.playerSearchesForItem(ARENA_ACTIONS.SEARCH_WEAPONS, {
          player,
          arenaZonesAvailable,
        })
      );
    });
  }

  async searchForArmors(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const playerActions = await ArenaRepository.playerActions(userRequesting, true, transaction);
      if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
        return playerActions as GameResponse;
      }
      const arenaZonesAvailable = await findActiveArenaZones(transaction);

      const { player, round } = playerActions as PlayerActionsDeadOrAlive;
      await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.SEARCH_ARMOR }, transaction);

      return getGameResponse(
        arenaCommandReply.playerSearchesForItem(ARENA_ACTIONS.SEARCH_ARMOR, {
          player,
          arenaZonesAvailable,
        })
      );
    });
  }

  async searchForHealth(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const playerActions = await ArenaRepository.playerActions(userRequesting, true, transaction);
      if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
        return playerActions as GameResponse;
      }
      const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;
      const arenaZonesAvailable = await findActiveArenaZones(transaction);
      const playerHasHealthkit = player.hasMaxHealthkits();

      if (!zone) {
        const actionBlockkit = generateActionsBlockKit(player, arenaCommandReply.zoneNeeded());
        return getGameResponse(actionBlockkit);
      }

      if (playerHasHealthkit) {
        const playerPerformance = await findSinglePlayerPerformance(
          player.id,
          round._gameId,
          transaction
        );
        const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

        const actionBlockkit = generateActionsBlockKit(
          player,
          hud,
          arenaCommandReply.playerCannotCarryMoreHealthkits()
        );
        return getGameResponse(actionBlockkit);
      }

      await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.SEARCH_HEALTH }, transaction);

      return getGameResponse(
        arenaCommandReply.playerSearchesForItem(ARENA_ACTIONS.SEARCH_HEALTH, {
          player,
          arenaZonesAvailable,
        })
      );
    });
  }

  // ADMINS ///////////////////////////////////////////////////////////////////
  async newGame(commandText: string, userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const teamBasedText = 'team based';
      const teamBasedTextNoSpaces = teamBasedText.replace(' ', '');
      const lowerCaseCommandText = commandText.toLowerCase();
      const isTeamBased =
        lowerCaseCommandText.includes(teamBasedText) ||
        lowerCaseCommandText.includes(teamBasedTextNoSpaces);
      const gameName = lowerCaseCommandText
        .replace(teamBasedText, '')
        .replace(teamBasedTextNoSpaces, '')
        .trim();
      const game = await startArenaGame(
        {
          name: gameName === '' ? generateRandomNameForGame(GAME_TYPE.ARENA) : gameName,
          _createdById: userRequesting.id,
          teamBased: isTeamBased,
        },
        transaction
      );

      await enableAllItems(GAME_TYPE.ARENA, transaction);
      return getGameResponse(arenaCommandReply.adminCreatedGame(game));
    });
  }

  async askEndGame(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      const endGameConfirmBlock = generateArenaEndGameConfirmationBlockKit();
      return getGameResponse(endGameConfirmBlock);
    });
  }

  async endGame(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      await enableAllItems(GAME_TYPE.ARENA, transaction);
      await game.endGame(transaction);
      await activateAllArenaZones(transaction);
      await publishArenaMessage(arenaCommandReply.channelEndGame(game), true);
      return getGameResponse(arenaCommandReply.adminEndedGame(game));
    });
  }

  async toggleZoneDeactivationSystem(userRequesting: User, isEnable: boolean) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      await game._arena?.toggleZoneDeactivation(isEnable, transaction);
      return getGameResponse(arenaCommandReply.adminToggleZoneDeactivation(isEnable));
    });
  }

  async cancelEndGame(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      return getGameResponse(arenaCommandReply.cancelEndGame());
    });
  }

  async addPlayer(commandText: string, userRequesting: User, channelId: string) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      if (isEmpty(commandText)) {
        return getGameError(arenaCommandReply.noCommandTextProvided());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }

      const { uniqueSlackIds } = await addPlayers(
        commandText,
        userRequesting,
        channelId,
        transaction
      );

      return getGameResponse(arenaCommandReply.adminAddedPlayers(Array.from(uniqueSlackIds)));
    });
  }

  async addSpectator(commandText: string, userRequesting: User, channelId: string) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      if (isEmpty(commandText)) {
        return getGameError(arenaCommandReply.noCommandTextProvided());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }

      const spectatorsAdded = await addSpectator(
        commandText,
        userRequesting,
        channelId,
        transaction
      );
      return getGameResponse(arenaCommandReply.adminAddedSpectators(spectatorsAdded));
    });
  }

  async addBossOrGuest(commandText: string, userRequesting: User, isBoss: boolean) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      if (isEmpty(commandText)) {
        return getGameError(
          isBoss ? arenaCommandReply.noBossProvided() : arenaCommandReply.noGuestProvided()
        );
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      const [teamName, usersList] = parseBossAndGuestCommandText(commandText);

      if (game._arena?.teamBased && !teamName) {
        return getGameError(arenaCommandReply.teamNameNeeded());
      }
      const completeSlackIds = parseCommandTextToSlackIds(usersList!, false);

      const users = await getOrCreateBossesOrGuests({
        fullSlackIds: completeSlackIds,
        teamName,
        isBoss,
        transaction,
      });

      const uniqueSlackIds = new Set<string>();
      completeSlackIds.forEach((fullSlackId) =>
        uniqueSlackIds.add(parseEscapedSlackUserValues(fullSlackId) as string)
      );
      const arenaBossesOrGuests = await addArenaPlayers(
        {
          gameId: game.id,
          users,
          areBosses: isBoss,
        },
        transaction
      );
      await addArenaPlayersToZones({ arenaPlayers: arenaBossesOrGuests }, transaction);
      return getGameResponse(
        arenaCommandReply.adminAddedBossesOrGuests(Array.from(uniqueSlackIds), isBoss)
      );
    });
  }

  async reviveBoss(commandText: string, userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const targetSlackId = parseRevivePlayerCommandText(commandText);
      const round = await findActiveRound(true, transaction);
      if (!round) {
        return getGameError(arenaCommandReply.noActiveRound());
      }
      if (!targetSlackId) {
        return getGameError(arenaCommandReply.noSlackIdProvided());
      }
      const targetUser = await getUserBySlackId(targetSlackId);

      if (!targetUser) {
        return getGameError(arenaCommandReply.userNotFound(targetSlackId));
      }

      const targetBossPlayer = await findPlayerByUser(
        round._gameId,
        targetUser.id,
        false,
        transaction
      );

      if (!targetBossPlayer) {
        return getGameError(arenaCommandReply.playerNotInTheGame());
      }

      if (!targetBossPlayer.isBoss) {
        return getGameError(arenaCommandReply.playerIsNotBoss(targetBossPlayer._user?.slackId!));
      }

      if (targetBossPlayer.health === MAX_BOSS_HEALTH) {
        return getGameError(arenaCommandReply.playerHealsSomebodyMaxed(targetSlackId));
      }
      await targetBossPlayer.reviveOrHeal(BOSS_HEALTHKIT_HEALING, MAX_BOSS_HEALTH, transaction);
      await publishArenaMessage(
        arenaCommandReply.channelBossRevived(targetSlackId, targetBossPlayer.health),
        true
      );
      return getGameResponse(arenaCommandReply.adminRevivedBoss(targetSlackId));
    });
  }

  async listPlayers(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }

      const playersAlive = await findLivingPlayersByGame(game.id, false, transaction);
      await publishArenaMessage(arenaCommandReply.channelDisplayPlayersInfo(playersAlive), true);
      return getGameResponse(arenaCommandReply.adminPlayersInfoPosted());
    });
  }

  async listSpectators(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }

      const spectators = await findSpectatorsByGame(game.id, transaction);
      await publishArenaMessage(arenaCommandReply.channelDisplaySpectators(spectators), true);
      return getGameResponse(arenaCommandReply.adminPlayersInfoPosted());
    });
  }

  async listIdlePlayers(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const round = await findActiveRound(true, transaction);
      if (!round) {
        return getGameError(arenaCommandReply.noActiveRound());
      }
      const actions = round._actions || [];
      const idlePlayers = await getIdlePlayers(round._gameId, actions, transaction);
      return getGameResponse(arenaCommandReply.adminIdlePlayers(idlePlayers));
    });
  }

  async makeAllVisible(channelId: string, userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const round = await findActiveRound(true, transaction);
      if (!round) {
        return getGameError(arenaCommandReply.noActiveRound());
      }
      await round.makeEveryoneVisible(transaction);
      await setAllPlayerVisibility(round._gameId, true, transaction);
      await publishArenaMessage(arenaCommandReply.channelAllVisible(), true);
      await notifyPlayersWhoWantedToHide(round.id, channelId);
      await removeActionFromRound(round.id, ARENA_ACTIONS.HIDE, transaction);
      return getGameResponse(arenaCommandReply.adminMadeAllVisible());
    });
  }

  async selectWeaponForEveryone(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      const allWeapons = await listActiveWeaponsByGameType(game._gameTypeId, transaction);
      const [randomWeapon] = sampleSize(allWeapons, ONE);

      const slackBlocks = generateGenericWeaponPickerBlock(
        arenaCommandReply.adminGiveWeaponForEveryone(),
        allWeapons,
        randomWeapon,
        ARENA_SECONDARY_ACTIONS.CONFIRM_GIVE_EVERYONE_WEAPONS
      );
      return getGameResponse(slackBlocks);
    });
  }

  async giveEveryoneWeapon(userRequesting: User, selectedWeapon: number) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const round = await findActiveRound(false, transaction);
      if (!round) {
        return getGameError(arenaCommandReply.noActiveRound());
      }
      const livingPlayers = await findLivingPlayersByGame(round._gameId, true, transaction);
      const weaponToGive = await findWeaponById(selectedWeapon, transaction);
      if (!weaponToGive) {
        return getGameError(arenaCommandReply.weaponNotFound());
      }
      await Promise.all(livingPlayers.map((player) => player.addWeapon(weaponToGive, transaction)));
      await publishArenaMessage(arenaCommandReply.channelWeaponsForEveryone(weaponToGive), true);
      return getGameResponse(arenaCommandReply.adminWeaponsForEveryone(weaponToGive!));
    });
  }

  async startNarrowWeaponsQuestion(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const round = await findActiveRound(true, transaction);
      if (!round) {
        return getGameError(arenaCommandReply.noActiveRound());
      }
      const game = round._game;
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      const allWeapons = await listActiveWeaponsByGameType(game._gameTypeId, transaction);
      const narrowWeaponsBlock = generateNarrowWeaponsBlock(allWeapons);
      return getGameResponse(narrowWeaponsBlock);
    });
  }

  async confirmNarrowWeapons(userRequesting: User, selectedIds: number[]) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (!game) {
        return getGameError(arenaCommandReply.noActiveGame());
      }
      await disableItems(game._gameTypeId, selectedIds, transaction);
      const allWeapons = await listAllItems(transaction);
      const { enabledWeapons, disabledWeapons } = allWeapons.reduce(
        (acc, item) => {
          const isItemActive = item._gameItemAvailability?.find(
            (itemAvailability) => itemAvailability._gameTypeId === game._gameTypeId
          )?.isActive;
          return {
            ...acc,
            ...(isItemActive
              ? { enabledWeapons: [...acc.enabledWeapons, item] }
              : { disabledWeapons: [...acc.disabledWeapons, item] }),
          };
        },
        { enabledWeapons: [], disabledWeapons: [] } as {
          enabledWeapons: Item[];
          disabledWeapons: Item[];
        }
      );
      return getGameResponse(
        arenaCommandReply.confirmNarrowWeapons(enabledWeapons, disabledWeapons)
      );
    });
  }

  async performance(userRequesting: User) {
    return withArenaTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (game) {
        return getGameError(arenaCommandReply.activeGame());
      }
      const lastGame = await findLastActiveArenaGame(transaction);
      if (!lastGame) {
        return getGameError(arenaCommandReply.noLastGame());
      }
      const firstBloodPerformance = await findFirstBlood(lastGame.id, transaction);
      const firstBloodHeader = PLAYER_PERFORMANCE_HEADER.FIRST_BLOOD;
      const firstBloodMessage =
        `\t1. ${generateTeamEmoji(firstBloodPerformance?._player?._user?._team?.emoji)} ` +
        `| <@${firstBloodPerformance?._player?._user?.slackId}>`;
      let mutableTopRankings = `${firstBloodHeader}\n${firstBloodMessage}`;
      for (const performanceField of Object.values(ARENA_PLAYER_PERFORMANCE)) {
        const playersPerformance = await findPlayersPerformanceByAction(
          lastGame.id,
          performanceField,
          transaction
        );
        if (playersPerformance) {
          const rankingHeader = generatePlayerPerformanceActionHeader(performanceField);
          const top = topPlayerPerformance(
            MAX_TOP_OUTSTANDING_PERFORMANCE,
            performanceField,
            playersPerformance
          );
          mutableTopRankings += `${rankingHeader}\n${top}`;
        }
      }
      await publishArenaMessage(
        arenaCommandReply.channelListOutstandingPerformance(mutableTopRankings),
        true
      );
      // Clean Arena Zones
      const allPlayers = await findPlayersByGame(lastGame.id, false, transaction);
      await removePlayersFromArenaZones(allPlayers, transaction);
      return getGameResponse('Outstanding Performance displayed');
    });
  }
}
