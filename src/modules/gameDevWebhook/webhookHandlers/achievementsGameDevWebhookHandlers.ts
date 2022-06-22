import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../api-utils/utils';
import { ZERO } from '../../../games/consts/global';
import type { User } from '../../../models';
import type { AchievementUnlockedCreationAttributes } from '../../../models/AchievementUnlocked';
import { createOrUpdateAchievementUnlocked } from '../../../models/AchievementUnlocked';
import type { Achievement } from '../../../models/Achievements';
import { findAllAchievementsByGameType, findAchievementById } from '../../../models/Achievements';

export const getAchievementsThruWebhookHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;
  const achievements = await findAllAchievementsByGameType(gameType.id);

  return h.response(arrayToJSON(achievements)).code(200);
};

export const postAchievementsProgressHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;
  const payload = request.pre.webhookPayload as AchievementUnlockedCreationAttributes;
  const user = request.pre.appendUserToRequest as User;

  const achievement = await validateAchievement(request.params.achievementId, gameType.id);

  const [rslt] = await createOrUpdateAchievementUnlocked({
    progress: payload.progress || ZERO,
    isUnlocked: true, // TODO payload.progress >= achievement.targetValue will be used on future release
    _userId: user.id,
    _achievementId: achievement.id,
  });

  return h.response(rslt.toJSON()).code(200);
};

const validateAchievement = async (
  achievementId: number,
  gameTypeId: number
): Promise<Achievement> => {
  const achievement = await findAchievementById(achievementId);

  if (achievement?._gameTypeId !== gameTypeId) {
    throw Boom.forbidden('achievement does not belong to that game');
  }

  return achievement;
};
