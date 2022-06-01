import { sampleSize } from 'lodash';

import type { User, Item } from '../../../../../../models';
import { findActiveArenaGame } from '../../../../../../models/ArenaGame';
import { findLivingPlayersByGame } from '../../../../../../models/ArenaPlayer';
import { findActiveRound } from '../../../../../../models/ArenaRound';
import { disableItems } from '../../../../../../models/GameItemAvailability';
import { listAllItems } from '../../../../../../models/Item';
import { findWeaponById, listActiveWeaponsByGameType } from '../../../../../../models/ItemWeapon';
import { ONE } from '../../../../../consts/global';
import { adminAction, getGameError, getGameResponse } from '../../../../../utils';
import { generateGenericWeaponPickerBlock } from '../../../../../utils/generators/games';
import { ARENA_SECONDARY_ACTIONS } from '../../../../consts';
import { generateNarrowWeaponsBlock } from '../../../../generators/weapons';
import { publishArenaMessage, withArenaTransaction } from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function selectWeaponForEveryone(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const game = await findActiveArenaGame(transaction);
    if (!game) {
      return getGameError(arenaCommandReply.noActiveGame());
    }
    const allWeapons = await listActiveWeaponsByGameType(game._gameType.name, transaction);
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

export async function giveEveryoneWeapon(userRequesting: User, selectedWeapon: number) {
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

export async function startNarrowWeaponsQuestion(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const round = await findActiveRound(true, transaction);
    if (!round) {
      return getGameError(arenaCommandReply.noActiveRound());
    }
    const game = round._game?._game;
    if (!game) {
      return getGameError(arenaCommandReply.noActiveGame());
    }
    const allWeapons = await listActiveWeaponsByGameType(game._gameType.name, transaction);
    const narrowWeaponsBlock = generateNarrowWeaponsBlock(allWeapons);
    return getGameResponse(narrowWeaponsBlock);
  });
}

export async function confirmNarrowWeapons(userRequesting: User, selectedIds: number[]) {
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
    return getGameResponse(arenaCommandReply.confirmNarrowWeapons(enabledWeapons, disabledWeapons));
  });
}
