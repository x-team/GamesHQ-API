import { User } from '../../../../../../models';
import { setRoundAction } from '../../../../../../models/TowerRoundAction';
import { GameResponse, getGameResponse } from '../../../../../utils';
import { TOWER_ACTIONS } from '../../../../consts';
import {
  generateTowerActionsBlockKit,
  generateTowerStartRoundQuestionSection,
} from '../../../../generators/gameplay';
import {
  raiderActionsAlive,
  TowerRaiderInteraction,
  withTowerTransaction,
} from '../../../../utils';
import { towerCommandReply } from '../../replies';

export async function hide(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    if (round.isEveryoneVisible) {
      const hud = towerCommandReply.raiderHUD(raider);
      const actionBlockkit = generateTowerActionsBlockKit(
        hud,
        towerCommandReply.raiderCannotHide()
      );
      return getGameResponse(actionBlockkit);
    }
    await setRoundAction(
      {
        raiderId: raider.id,
        roundId: round.id,
        action: { id: TOWER_ACTIONS.HIDE },
      },
      transaction
    );
    const blocks = generateTowerStartRoundQuestionSection(towerCommandReply.raiderHides());
    return getGameResponse(blocks);
  });
}
