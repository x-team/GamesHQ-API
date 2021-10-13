import { logger } from '../../../../config';
import { GameItemAvailabilityCreationAttributes } from '../../../../models/GameItemAvailability';
import { createOrUpdateWeapon } from '../../../../models/ItemWeapon';
import { withWeaponTransaction } from '../../../arena/utils';
import { GAME_TYPE, ITEM_RARITY, ITEM_TYPE, TRAIT } from '../../../consts/global';

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
    const gameAvailability: GameItemAvailabilityCreationAttributes[] = data.gameAvailability.map(
      (gameAvailability) => ({
        _gameTypeId: gameAvailability,
        isArchived: data.isArchived,
        isActive: !data.isArchived,
      })
    );

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
