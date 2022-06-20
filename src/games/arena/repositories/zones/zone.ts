import type { ArenaZone, User } from '../../../../models';
import { findActiveArenaGame } from '../../../../models/ArenaGame';
import type { ArenaZoneCreationAttributes } from '../../../../models/ArenaZone';
import {
  createOrUpdateArenaZone,
  deactivateZones,
  deleteZoneById,
  findAllArenaZones,
  findArenaZoneById,
} from '../../../../models/ArenaZone';
import type { ZoneData } from '../../../model/SlackDialogObject';
import type { GameResponse } from '../../../utils';
import { adminAction, getGameError, getGameResponse } from '../../../utils';
import { ARENA_ZONE_RING } from '../../consts';
import {
  generateArenaZoneModal,
  generateAvailableZonesBlockKit,
  generateNarrowZonesBlock,
} from '../../generators/zones';
import { arenaNotifyEphemeral, arenaOpenView, withZoneTransaction } from '../../utils';
import { arenaCommandReply } from '../arena/replies';

export const zoneRepositoryReplies = {
  zoneCreated: (zone: ArenaZone) =>
    `Zone ${zone.emoji} *${zone.name}* created/updated successfully.`,
  zoneDeleted: () => `Zone deleted successfully`,
  zoneFormIncomplete: () => 'The zone form is incomplete to proceed',
  invalidRingSystemCode: () => 'Zone code for location is invalid.',
};

export class ZoneRepository {
  static getInstance(): ZoneRepository {
    if (!ZoneRepository.instance) {
      ZoneRepository.instance = new ZoneRepository();
    }
    return ZoneRepository.instance;
  }

  static async openZoneModal(triggerId: string, existingZoneId?: string) {
    let existingZone;
    if (existingZoneId) {
      existingZone = (await findArenaZoneById(parseInt(existingZoneId))) as ArenaZone;
    }

    const dialogView = generateArenaZoneModal(existingZone);
    await arenaOpenView({
      trigger_id: triggerId,
      view: dialogView,
    });
    return getGameResponse('Opening zone modal...');
  }

  private static instance: ZoneRepository;

  private constructor() {}

  async openCreateZoneModal(userRequesting: User, triggerId: string): Promise<void | GameResponse> {
    return withZoneTransaction(async () => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      return ZoneRepository.openZoneModal(triggerId);
    });
  }

  async listZones(userRequesting: User): Promise<void | GameResponse> {
    return withZoneTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const zones = await findAllArenaZones(transaction);
      const allZonesBlock = generateAvailableZonesBlockKit(zones);
      return getGameResponse(allZonesBlock);
    });
  }

  async narrowZones(userRequesting: User): Promise<void | GameResponse> {
    return withZoneTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (game) {
        return getGameError(arenaCommandReply.activeGame());
      }
      const allZones = await findAllArenaZones(transaction);
      const narrowZonesBlock = generateNarrowZonesBlock(allZones);
      return getGameResponse(narrowZonesBlock);
    });
  }

  async confirmNarrowZones(userRequesting: User, selectedIds: number[]) {
    return withZoneTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      const game = await findActiveArenaGame(transaction);
      if (game) {
        return getGameError(arenaCommandReply.activeGame());
      }
      await deactivateZones(selectedIds, transaction);
      const allZones = await findAllArenaZones(transaction);
      const { enabledZones, disabledZones } = allZones.reduce(
        (acc, zone) => {
          return {
            ...acc,
            ...(zone.isActive
              ? { enabledZones: [...acc.enabledZones, zone] }
              : { disabledZones: [...acc.disabledZones, zone] }),
          };
        },
        { enabledZones: [], disabledZones: [] } as {
          enabledZones: ArenaZone[];
          disabledZones: ArenaZone[];
        }
      );

      return getGameResponse(arenaCommandReply.confirmNarrowZones(enabledZones, disabledZones));
    });
  }

  async createOrUpdateZoneForm(
    userRequesting: User,
    zoneData: ZoneData
  ): Promise<void | GameResponse> {
    return withZoneTransaction(async () => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }

      const {
        ['create-or-update-zone-data-name']: {
          ['create-or-update-zone-data-name-action']: { value: nameProvided },
        },
        ['create-or-update-zone-data-emoji']: {
          ['create-or-update-zone-data-emoji-action']: { value: emojiProvided },
        },
        ['create-or-update-zone-data-code']: {
          ['create-or-update-zone-data-code-action']: {
            selected_option: { value: codeProvided },
          },
        },
        ['create-or-update-zone-data-is-archived']: {
          ['create-or-update-zone-data-is-archived-action']: {
            selected_option: { value: isArchivedProvided },
          },
        },
      } = zoneData;
      if (!nameProvided || !emojiProvided || !codeProvided) {
        return getGameError(zoneRepositoryReplies.zoneFormIncomplete());
      }
      const hasValidCode = Object.values(ARENA_ZONE_RING).includes(codeProvided as ARENA_ZONE_RING);
      if (!hasValidCode) {
        return getGameError(zoneRepositoryReplies.invalidRingSystemCode());
      }
      const zoneInfo: ArenaZoneCreationAttributes = {
        name: nameProvided,
        emoji: emojiProvided,
        ring: codeProvided as ARENA_ZONE_RING,
        isArchived: isArchivedProvided === 'true' ? true : false,
      };
      const [zone] = await createOrUpdateArenaZone(zoneInfo);
      await arenaNotifyEphemeral(
        zoneRepositoryReplies.zoneCreated(zone),
        userRequesting.slackId!,
        userRequesting.slackId!
      );
      return getGameResponse('Create/Update zone starting...');
    });
  }

  async deleteZone(userRequesting: User, zoneId: string): Promise<void | GameResponse> {
    return withZoneTransaction(async (transaction) => {
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }

      await deleteZoneById(parseInt(zoneId), transaction);
      await arenaNotifyEphemeral(
        zoneRepositoryReplies.zoneDeleted(),
        userRequesting.slackId!,
        userRequesting.slackId!
      );
      return getGameResponse(zoneRepositoryReplies.zoneDeleted());
    });
  }
}
