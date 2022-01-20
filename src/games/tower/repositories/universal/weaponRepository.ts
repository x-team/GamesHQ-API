import type { AnonymousGameItemAvailabilityCreationAttributes } from '../../../../models/GameItemAvailability';
import { deleteItem } from '../../../../models/Item';
import { createOrUpdateWeapon } from '../../../../models/ItemWeapon';
import { withWeaponTransaction } from '../../../arena/utils';
import type { GAME_TYPE, ITEM_RARITY, TRAIT } from '../../../consts/global';
import { ITEM_TYPE } from '../../../consts/global';

export interface IWeaponEditorData {
  id?: number;
  name: string;
  emoji: string;
  rarity: ITEM_RARITY;
  isArchived: boolean;
  minorDamageRate: number;
  majorDamageRate: number;
  usageLimit: number | null;
  traits: string[];
  gameAvailability: GAME_TYPE[];
}

export const upsertWeapon = async (data: IWeaponEditorData) => {
  return withWeaponTransaction((transaction) => {
    const gameAvailability: AnonymousGameItemAvailabilityCreationAttributes[] =
      data.gameAvailability.map((gameAvailability) => ({
        _gameTypeId: gameAvailability,
        isArchived: data.isArchived,
        isActive: !data.isArchived,
      }));

    return createOrUpdateWeapon(
      {
        ...(data.id && { id: data.id }),
        _itemRarityId: data.rarity,
        emoji: data.emoji,
        usageLimit: data.usageLimit,
        name: data.name,
        type: ITEM_TYPE.WEAPON,
        traits: data.traits as TRAIT[],
      },
      {
        minorDamageRate: data.minorDamageRate,
        majorDamageRate: data.majorDamageRate,
      },
      gameAvailability,
      transaction
    );
  });
};

export const deleteWeapon = async (itemId: number) => {
  return withWeaponTransaction(async (transaction) => {
    return deleteItem(itemId, transaction);
  });
};
