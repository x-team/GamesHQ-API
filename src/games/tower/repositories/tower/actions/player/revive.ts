import { random } from 'lodash';
import { User } from '../../../../../../models';
import { findHealthkitByName } from '../../../../../../models/ItemHealthKit';
import {
  findRaiderByUser,
  findRaidersByFloorBattlefield,
} from '../../../../../../models/TowerRaider';
import { setRoundAction } from '../../../../../../models/TowerRoundAction';
import { ZERO } from '../../../../../consts/global';
import { GameResponse, getGameResponse } from '../../../../../utils';
import { MAX_RAIDER_HEALTH, TOWER_ACTIONS, TOWER_HEALTHKITS } from '../../../../consts';
import {
  generateTowerActionsBlockKit,
  generateTowerStartRoundQuestionSection,
  generateTowerTargetRaiderPickerBlock,
} from '../../../../generators/gameplay';
import {
  raiderActionsAlive,
  TowerRaiderInteraction,
  withTowerTransaction,
} from '../../../../utils';
import { towerCommandReply } from '../../replies';

export async function reviveSelf(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    const hud = towerCommandReply.raiderHUD(raider);
    const healthKit = await findHealthkitByName(TOWER_HEALTHKITS.COMMON, transaction);
    const healthKitQty = healthKit ? raider.healthkitQty(healthKit.id) : ZERO;

    if (healthKitQty > ZERO) {
      if (raider.health === MAX_RAIDER_HEALTH) {
        const actionBlockkit = generateTowerActionsBlockKit(
          hud,
          towerCommandReply.raiderCannotCarryMoreHealthkits()
        );
        return getGameResponse(actionBlockkit);
      }
      await setRoundAction(
        {
          raiderId: raider.id,
          roundId: round.id,
          action: { id: TOWER_ACTIONS.REVIVE, targetRaiderId: raider.id },
        },
        transaction
      );
      const raiderWillBeVisible = round.isEveryoneVisible ? true : raider.isVisible;
      const blocks = generateTowerStartRoundQuestionSection(
        towerCommandReply.raiderHealsSelf(
          raiderWillBeVisible,
          healthKit?._healthkit?.healingPower ?? ZERO
        )
      );
      return getGameResponse(blocks);
    } else {
      const actionBlockkit = generateTowerActionsBlockKit(
        hud,
        towerCommandReply.raiderNeedsHealthKit()
      );
      return getGameResponse(actionBlockkit);
    }
  });
}

export async function reviveOther(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    const hud = towerCommandReply.raiderHUD(raider);
    const healthKit = await findHealthkitByName(TOWER_HEALTHKITS.COMMON, transaction);
    const healthKitQty = healthKit ? raider.healthkitQty(healthKit.id) : ZERO;

    if (healthKitQty > ZERO) {
      const allRaiders = await findRaidersByFloorBattlefield(
        round._towerFloorBattlefieldId,
        false,
        transaction
      );
      const raidersToDropdown = allRaiders.filter((r) => r.id !== raider.id);
      const slackBlocks = generateTowerTargetRaiderPickerBlock(
        raidersToDropdown,
        raidersToDropdown[random(raidersToDropdown.length)]._user?.slackId!,
        'tower-reviveother'
      );
      return getGameResponse(slackBlocks);
    } else {
      const actionBlockkit = generateTowerActionsBlockKit(
        hud,
        towerCommandReply.raiderNeedsHealthKit()
      );
      return getGameResponse(actionBlockkit);
    }
  });
}

export async function completeRevive(userRequesting: User, selectedTargetId: number) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    const targetRaider = await findRaiderByUser(selectedTargetId, false, transaction);
    if (!targetRaider) {
      return getGameResponse(towerCommandReply.raiderNotInTheGame());
    }
    const targetRaiderSlackId = targetRaider._user?.slackId!;
    const isSelf = raider.id === targetRaider.id;
    if (targetRaider.health === MAX_RAIDER_HEALTH) {
      const messageToDisplay = isSelf
        ? towerCommandReply.raiderHealsSelfMaxed()
        : towerCommandReply.raiderHealsSomebodyMaxed(targetRaiderSlackId);
      const hud = towerCommandReply.raiderHUD(raider);
      const actionBlockkit = generateTowerActionsBlockKit(hud, messageToDisplay);
      return getGameResponse(actionBlockkit);
    }
    await setRoundAction(
      {
        raiderId: raider.id,
        roundId: round.id,
        action: { id: TOWER_ACTIONS.REVIVE, targetRaiderId: targetRaider.id },
      },
      transaction
    );
    const raiderWillBeVisible = round.isEveryoneVisible ? true : raider.isVisible;
    const healthKit = await findHealthkitByName(TOWER_HEALTHKITS.COMMON, transaction);
    const blocks = generateTowerStartRoundQuestionSection(
      isSelf
        ? towerCommandReply.raiderHealsSelf(
            raiderWillBeVisible,
            healthKit?._healthkit?.healingPower ?? ZERO
          )
        : towerCommandReply.raiderHealsSomebody(
            targetRaiderSlackId,
            raiderWillBeVisible,
            healthKit?._healthkit?.healingPower ?? ZERO
          )
    );
    return getGameResponse(blocks);
  });
}
