import type { User } from '../../../../../../models';
import { setAllPlayerVisibility } from '../../../../../../models/ArenaPlayer';
import { findActiveRound } from '../../../../../../models/ArenaRound';
import { removeActionFromRound } from '../../../../../../models/ArenaRoundAction';
import { adminAction, getGameError, getGameResponse } from '../../../../../utils';
import { ARENA_ACTIONS } from '../../../../consts';
import { publishArenaMessage, withArenaTransaction } from '../../../../utils';
import { arenaCommandReply, notifyPlayersWhoWantedToHide } from '../../replies';

export async function makeAllVisible(channelId: string, userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const isAdmin = adminAction(userRequesting);
    if (!isAdmin) {
      return getGameError(arenaCommandReply.adminsOnly());
    }
    const round = await findActiveRound(true, transaction);
    if (!round) {
      return getGameError(arenaCommandReply.noActiveRound());
    }
    await round.makeEveryoneVisible(transaction);
    await setAllPlayerVisibility(round._gameId, true, transaction);
    await publishArenaMessage(arenaCommandReply.channelAllVisible(), true);
    await notifyPlayersWhoWantedToHide(round.id, channelId);
    await removeActionFromRound(round.id, ARENA_ACTIONS.HIDE, transaction);
    return getGameResponse(arenaCommandReply.adminMadeAllVisible());
  });
}
