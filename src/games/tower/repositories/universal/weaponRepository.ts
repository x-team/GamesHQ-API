import { logger } from '../../../../config';
import { GameItemAvailabilityCreationAttributes } from '../../../../models/GameItemAvailability';
import { createOrUpdateWeapon } from '../../../../models/ItemWeapon';
import { withWeaponTransaction } from '../../../arena/utils';
import { GAME_TYPE, ITEM_RARITY, ITEM_TYPE } from '../../../consts/global';

export interface IWeaponEditorData {
  id?: string;
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

export const creteWeapon = async (data: IWeaponEditorData) => {
  logger.debug(data);
  return withWeaponTransaction((transaction) => {
    const gameAvailability: GameItemAvailabilityCreationAttributes[] = data.gameAvailability.map(
      (gameAvailability) => ({
        _gameTypeId: gameAvailability,
        isArchived: data.isArchived,
        isActive: !data.isArchived,
      })
    );

    logger.debug(gameAvailability);

    return createOrUpdateWeapon(
      {
        _itemRarityId: data.rarity,
        emoji: data.emoji,
        usageLimit: data.usageLimit,
        name: data.name,
        type: ITEM_TYPE.WEAPON,
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
