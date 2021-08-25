import { User } from '../../../../../../models';
import { findSinglePlayerPerformance } from '../../../../../../models/ArenaPlayerPerformance';
import { setPlayerRoundAction } from '../../../../../../models/ArenaRoundAction';
import { findActiveArenaZones } from '../../../../../../models/ArenaZone';
import { GameResponse, getGameResponse } from '../../../../../utils';
import { ARENA_ACTIONS } from '../../../../consts';
import { generateArenaActionsBlockKit } from '../../../../generators/gameplay';
import {
  PlayerActionsDeadOrAlive,
  playerActionsParams,
  withArenaTransaction,
} from '../../../../utils';
import { arenaCommandReply } from '../../replies';

export async function hide(userRequesting: User) {
  return withArenaTransaction(async (transaction) => {
    const playerActions = await playerActionsParams(userRequesting, true, transaction);
    if (!(playerActions as PlayerActionsDeadOrAlive).interfaceName) {
      return playerActions as GameResponse;
    }
    const { player, round, zone } = playerActions as PlayerActionsDeadOrAlive;

    if (!zone) {
      const actionBlockkit = generateArenaActionsBlockKit(player, arenaCommandReply.zoneNeeded());
      return getGameResponse(actionBlockkit);
    }

    const playerPerformance = await findSinglePlayerPerformance(
      player.id,
      round._gameId,
      transaction
    );
    const hud = arenaCommandReply.playerHUD(player, zone, playerPerformance);

    if (round.isEveryoneVisible) {
      const actionBlockkit = generateArenaActionsBlockKit(
        player,
        hud,
        arenaCommandReply.playerCannotHide()
      );
      return getGameResponse(actionBlockkit);
    }

    await setPlayerRoundAction(player, round, { id: ARENA_ACTIONS.HIDE }, transaction);
    const arenaZonesAvailable = await findActiveArenaZones(transaction);
    const changeLocationParams = {
      player,
      arenaZonesAvailable,
    };
    return getGameResponse(arenaCommandReply.playerHides(changeLocationParams));
  });
}
