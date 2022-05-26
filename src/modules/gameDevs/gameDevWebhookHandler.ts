import { Lifecycle } from '@hapi/hapi';
import { findAllAchievementsByGameType } from '../../models/Achievements';

// 🎮 Games
export const getAchievementsThruWebhookHandler: Lifecycle.Method = async (request, h) => {
  const { gameType } = request.pre.webhookValidation;
  const achievements = await findAllAchievementsByGameType(gameType.id);
  // if () {
  //   throw Boom.forbidden('User is not the owner of the game');
  // }
  return h.response({ achievements }).code(200);
};
