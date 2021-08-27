import type { Transaction } from 'sequelize';
import { User } from '../../../../../../models';
import { setRoundAction, TOWER_ACTIONS_TYPE } from '../../../../../../models/TowerRoundAction';
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

async function evaluateSearchForItem(
  { raider, round, actionId }: TowerRaiderInteraction & { actionId: TOWER_ACTIONS_TYPE },
  transaction: Transaction
) {
  await setRoundAction(
    {
      raiderId: raider.id,
      roundId: round.id,
      action: { id: actionId },
    },
    transaction
  );
  const blocks = generateTowerStartRoundQuestionSection(
    towerCommandReply.raiderSearchesForItem(actionId)
  );
  return getGameResponse(blocks);
}

export async function searchForWeapons(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    return evaluateSearchForItem(
      {
        interfaceName: 'TowerRaiderInteraction',
        raider,
        round,
        actionId: TOWER_ACTIONS.SEARCH_WEAPONS,
      },
      transaction
    );
  });
}

export async function searchForArmors(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    return evaluateSearchForItem(
      {
        interfaceName: 'TowerRaiderInteraction',
        raider,
        round,
        actionId: TOWER_ACTIONS.SEARCH_ARMOR,
      },
      transaction
    );
  });
}

export async function searchForHealthkits(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    const raidersHealthkits = raider.hasMaxHealthkits();
    if (raidersHealthkits) {
      const hud = towerCommandReply.raiderHUD(raider);
      const actionBlockkit = generateTowerActionsBlockKit(
        hud,
        towerCommandReply.raiderCannotCarryMoreHealthkits()
      );
      return getGameResponse(actionBlockkit);
    }
    return evaluateSearchForItem(
      {
        interfaceName: 'TowerRaiderInteraction',
        raider,
        round,
        actionId: TOWER_ACTIONS.SEARCH_HEALTH,
      },
      transaction
    );
  });
}
