import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../../api-utils/utils';
import type { GameType } from '../../../../models';
import { getAchievementUnlockedFromAchievement } from '../../../../models/AchievementUnlocked';
import type { AchievementEditorData } from '../../../../models/Achievements';
import {
  findAchievementById,
  findAllAchievementsByGameType,
  getAchievementByCreator,
  createOrUpdateAchievement,
  deleteAchievementById,
} from '../../../../models/Achievements';

export const getAchievementsHandler: Lifecycle.Method = async (request, h) => {
  if (request.params.achievementId) {
    const achievement = await getAchievementByCreator(
      request.params.achievementId,
      request.params.gameTypeId,
      request.pre.getAuthUser.id
    );

    if (!achievement) {
      throw Boom.notFound('achievement not found');
    }

    return h.response(achievement?.toJSON()).code(200);
  } else {
    const achievements = await findAllAchievementsByGameType(request.params.gameTypeId);
    return h.response(arrayToJSON(achievements)).code(200);
  }
};

export const getAchievementProgressHandler: Lifecycle.Method = async (request, h) => {
  if (!request.params.achievementId) {
    throw Boom.notFound('Invalid achievementId');
  }
  const achievement = await findAchievementById(request.params.achievementId);

  if (!achievement) {
    throw Boom.notFound('achievement not found');
  }
  const achievementUnlockedList = await getAchievementUnlockedFromAchievement(achievement);

  const achievementUnlockedListRes = arrayToJSON(achievementUnlockedList);

  return h.response(achievementUnlockedListRes).code(200);
};

export const upsertAchievementHandler: Lifecycle.Method = async (request, h) => {
  const payload = request.payload as AchievementEditorData;
  const game = request.pre.game as GameType;

  if (payload.id && game && !game._achievements?.map((a) => a.id).includes(payload.id)) {
    throw Boom.forbidden(`achievement does not belong to gametypeId ${request.params.gameTypeId}`);
  }

  const [rslt] = await createOrUpdateAchievement({ ...payload }, request.params.gameTypeId);

  return h.response(rslt?.toJSON()).code(200);
};

export const deleteAchievementHandler: Lifecycle.Method = async (request, h) => {
  const rslt = await deleteAchievementById(request.params.achievementId);

  if (!rslt) {
    throw Boom.notFound('achievement not found');
  }

  return h.response({ success: true }).code(200);
};
