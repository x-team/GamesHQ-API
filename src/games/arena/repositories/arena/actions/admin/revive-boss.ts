import type { User } from '../../../../../../models';
import { findPlayerByUser } from '../../../../../../models/ArenaPlayer';
import { findActiveRound } from '../../../../../../models/ArenaRound';
import { getUserBySlackId } from '../../../../../../models/User';
import { adminAction, getGameError, getGameResponse } from '../../../../../utils';
import { BOSS_HEALTHKIT_HEALING, MAX_BOSS_HEALTH } from '../../../../consts';
import {
  parseRevivePlayerCommandText,
  publishArenaMessage,
  withArenaTransaction,
} from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function reviveBoss(commandText: string, userRequesting: User) {
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
