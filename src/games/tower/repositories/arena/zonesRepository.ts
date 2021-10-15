import { logger } from '../../../../config';
import { createOrUpdateArenaZone, deleteZoneById } from '../../../../models/ArenaZone';
import { ARENA_ZONE_RING } from '../../../arena/consts';
import { withZoneTransaction } from '../../../arena/utils';

export interface IZoneEditorData {
  id?: number;
  name: string;
  emoji: string;
  ring: string;
  isArchived: boolean;
}

export const upsertZone = async (data: IZoneEditorData) => {
  logger.info({ data });
  return withZoneTransaction(async () => {
    const values = {
      ...(data.id && { id: data.id }),
      name: data.name,
      emoji: data.emoji,
      isArchived: data.isArchived,
      ring: data.ring as ARENA_ZONE_RING,
      isActive: data.isArchived,
    };
    logger.info({ values });
    return createOrUpdateArenaZone(values);
  });
};

export const deleteZone = async (zoneId: number) => {
  return withZoneTransaction(async (transaction) => {
    return deleteZoneById(zoneId, transaction);
  });
};
