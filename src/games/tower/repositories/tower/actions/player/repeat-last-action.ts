import type { User } from '../../../../../../models';
import { findWeaponById } from '../../../../../../models/ItemWeapon';
import { findBattlefieldEnemyById } from '../../../../../../models/TowerFloorBattlefieldEnemy';
import { findPreviousRound } from '../../../../../../models/TowerRound';
import { findLastRaiderActionByRound } from '../../../../../../models/TowerRoundAction';
import { TRAIT, ZERO } from '../../../../../consts/global';
import type { GameResponse } from '../../../../../utils';
import { getGameResponse } from '../../../../../utils';
import { TOWER_ACTIONS } from '../../../../consts';
import { generateTowerActionsBlockKit } from '../../../../generators/gameplay';
import type { TowerRaiderInteraction } from '../../../../utils';
import { raiderActionsAlive, withTowerTransaction } from '../../../../utils';
import { towerCommandReply } from '../../replies';

import { hideHelper } from './hide';
import { chooseHuntTargetHelper, huntHelper } from './hunt';
import { completeReviveHelper, reviveSelfHelper } from './revive';
import { searchForItemHelper } from './search';

export async function repeatLastAction(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    const hud = towerCommandReply.raiderHUD(raider);
    const previousRound = await findPreviousRound(round._towerFloorBattlefieldId, transaction);
    if (!previousRound) {
      const actionBlockkit = generateTowerActionsBlockKit(
        hud,
        towerCommandReply.raiderHasNoPreviousAction()
      );
      return getGameResponse(actionBlockkit);
    }
    const raidersLastAction = await findLastRaiderActionByRound(
      { raiderId: raider.id, roundId: previousRound.id },
      transaction
    );
    if (!raidersLastAction) {
      const actionBlockkit = generateTowerActionsBlockKit(
        hud,
        towerCommandReply.raiderHasNoPreviousAction()
      );
      return getGameResponse(actionBlockkit);
    }
    const {
      id: actionId,
      targetFloorBattlefieldEnemyId,
      targetRaiderId,
      weaponId,
    } = raidersLastAction.actionJSON;
    switch (actionId) {
      case TOWER_ACTIONS.HIDE:
        return hideHelper(
          {
            interfaceName: 'TowerRaiderInteraction',
            raider,
            round,
          },
          transaction
        );
      case TOWER_ACTIONS.SEARCH_HEALTH:
        const raidersHealthkits = raider.hasMaxHealthkits();
        if (raidersHealthkits) {
          const actionBlockkit = generateTowerActionsBlockKit(
            hud,
            towerCommandReply.raiderCannotCarryMoreHealthkits()
          );
          return getGameResponse(actionBlockkit);
        }
        return searchForItemHelper(
          {
            interfaceName: 'TowerRaiderInteraction',
            raider,
            round,
            actionId: TOWER_ACTIONS.SEARCH_HEALTH,
          },
          transaction
        );
      case TOWER_ACTIONS.SEARCH_ARMOR:
        return searchForItemHelper(
          {
            interfaceName: 'TowerRaiderInteraction',
            raider,
            round,
            actionId,
          },
          transaction
        );
      case TOWER_ACTIONS.SEARCH_WEAPONS:
        return searchForItemHelper(
          {
            interfaceName: 'TowerRaiderInteraction',
            raider,
            round,
            actionId,
          },
          transaction
        );
      case TOWER_ACTIONS.REVIVE:
        if (targetRaiderId === raider.id) {
          return reviveSelfHelper(
            { interfaceName: 'TowerRaiderInteraction', raider, round },
            transaction
          );
        } else {
          return completeReviveHelper(
            {
              interfaceName: 'TowerRaiderInteraction',
              raider,
              round,
              selectedTargetId: targetRaiderId!,
            },
            transaction
          );
        }
      case TOWER_ACTIONS.HUNT:
        const weapon = await findWeaponById(weaponId ?? ZERO, transaction);
        const weaponHasDetect = weapon?.hasTrait(TRAIT.DETECT);
        if (!weapon) {
          const actionBlockkit = generateTowerActionsBlockKit(
            hud,
            towerCommandReply.weaponNotFound()
          );
          return getGameResponse(actionBlockkit);
        }
        const raidersWeapon = raider._weapons?.filter((w) => w.id === weapon.id);
        const weaponFound = raider.itemsAvailable(raidersWeapon)[ZERO];
        if (!weaponFound) {
          const actionBlockkit = generateTowerActionsBlockKit(
            hud,
            towerCommandReply.raiderHasNoPreviousActionWeapon()
          );
          return getGameResponse(actionBlockkit);
        }
        if (targetFloorBattlefieldEnemyId) {
          const towerFloorEnemy = await findBattlefieldEnemyById(
            targetFloorBattlefieldEnemyId,
            transaction
          );
          if (!towerFloorEnemy) {
            const actionBlockkit = generateTowerActionsBlockKit(
              hud,
              towerCommandReply.enemyNotInTheGame()
            );
            return getGameResponse(actionBlockkit);
          }
          if (towerFloorEnemy && !weaponHasDetect && !towerFloorEnemy?.isVisible) {
            const actionBlockkit = generateTowerActionsBlockKit(
              hud,
              towerCommandReply.enemyHiding()
            );
            return getGameResponse(actionBlockkit);
          }
          return chooseHuntTargetHelper(
            {
              interfaceName: 'TowerRaiderInteraction',
              raider,
              round,
              selectedTargetId: towerFloorEnemy._towerFloorEnemyId,
              actionJSON: {
                id: actionId,
                weaponId: weaponFound.id,
              },
            },
            transaction
          );
        } else {
          return huntHelper(
            {
              interfaceName: 'TowerRaiderInteraction',
              raider,
              round,
              weapon: weaponFound,
            },
            transaction
          );
        }
      default:
        return getGameResponse(towerCommandReply.somethingWentWrong('Invalid Action'));
    }
  });
}
