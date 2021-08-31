import type { Transaction } from 'sequelize';
import { Item, Trait, User } from '../../../../../../models';
import { TowerAction } from '../../../../../../models/AvailableAction';
import { findWeaponById } from '../../../../../../models/ItemWeapon';
import {
  findEnemiesByFloorBattlefield,
  findEnemyByFloorBattlefield,
  findVisibleEnemies,
} from '../../../../../../models/TowerFloorBattlefieldEnemy';
import { findRoundAction, setRoundAction } from '../../../../../../models/TowerRoundAction';
import { ONE, TRAIT, ZERO } from '../../../../../consts/global';
import { GameResponse, getGameResponse } from '../../../../../utils';
import { generateGenericWeaponPickerBlock } from '../../../../../utils/generators/games';
import { TOWER_ACTIONS, TOWER_SECONDARY_SLACK_ACTIONS } from '../../../../consts';
import {
  generateTowerActionsBlockKit,
  generateTowerStartRoundQuestionSection,
  generateTowerTargetEnemyPickerBlock,
} from '../../../../generators/gameplay';
import {
  raiderActionsAlive,
  TowerRaiderInteraction,
  withTowerTransaction,
} from '../../../../utils';
import { towerCommandReply } from '../../replies';

export async function chooseHuntTargetHelper(
  {
    raider,
    round,
    selectedTargetId,
    actionJSON,
  }: TowerRaiderInteraction & { selectedTargetId: number; actionJSON?: TowerAction },
  transaction: Transaction
) {
  const roundAction = await findRoundAction(
    { raiderId: raider.id, roundId: round.id },
    transaction
  );
  if (!roundAction && !actionJSON) {
    return getGameResponse(towerCommandReply.raiderDoesntHaveAction());
  }
  const targetEnemy = await findEnemyByFloorBattlefield(
    round._towerFloorBattlefieldId,
    selectedTargetId,
    transaction
  );
  if (!targetEnemy || !targetEnemy.isAlive()) {
    const hud = towerCommandReply.raiderHUD(raider);
    const actionBlockkit = generateTowerActionsBlockKit(hud, towerCommandReply.enemyNotInTheGame());
    return getGameResponse(actionBlockkit);
  }
  const actionJson = actionJSON || roundAction!.actionJSON;
  await setRoundAction(
    {
      raiderId: raider.id,
      roundId: round.id,
      action: { ...actionJson, targetFloorBattlefieldEnemyId: targetEnemy.id },
    },
    transaction
  );
  const weapon = await findWeaponById(actionJson.weaponId!, transaction);
  const raiderWillBeVisible = weapon?.hasTrait(TRAIT.STEALTH) ? raider.isVisible : true;
  const blocks = generateTowerStartRoundQuestionSection(
    towerCommandReply.raiderHuntsEnemies(weapon!, raiderWillBeVisible)
  );
  return getGameResponse(blocks);
}

export async function huntHelper(
  { raider, round, weapon }: TowerRaiderInteraction & { weapon: Item },
  transaction: Transaction
) {
  const raiderWillBeVisible = weapon.hasTrait(TRAIT.STEALTH) ? raider.isVisible : true;
  await setRoundAction(
    {
      raiderId: raider.id,
      roundId: round.id,
      action: { id: TOWER_ACTIONS.HUNT, weaponId: weapon.id },
    },
    transaction
  );
  let visibleEnemies = [];
  if (weapon.hasTrait(TRAIT.DETECT)) {
    visibleEnemies = await findEnemiesByFloorBattlefield(
      round._towerFloorBattlefieldId,
      transaction
    );
  } else {
    visibleEnemies = await findVisibleEnemies(round._towerFloorBattlefieldId, transaction);
  }
  const filteredEnemies = visibleEnemies.filter((enemy) => enemy.isAlive());
  if (filteredEnemies.length === ZERO) {
    const raiderHuntEnemiesblocks = generateTowerStartRoundQuestionSection(
      towerCommandReply.raiderHuntsEnemies(weapon, raiderWillBeVisible)
    );
    return getGameResponse(raiderHuntEnemiesblocks);
  }
  const slackBlocks = generateTowerTargetEnemyPickerBlock(
    filteredEnemies,
    TOWER_SECONDARY_SLACK_ACTIONS.HUNT_CHOOSE_TARGET,
    towerCommandReply.raiderChooseTarget()
  );
  return getGameResponse(slackBlocks);
}

export async function hunt(userRequesting: User) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    const weapons = raider.itemsAvailable(raider._weapons);
    const weaponQty = weapons.length;

    if (weaponQty === ZERO) {
      const hud = towerCommandReply.raiderHUD(raider);
      const actionBlockkit = generateTowerActionsBlockKit(
        hud,
        towerCommandReply.raiderNeedsWeapon()
      );
      return getGameResponse(actionBlockkit);
    }
    if (weaponQty > ONE) {
      const slackBlocks = generateGenericWeaponPickerBlock(
        towerCommandReply.raiderChooseWeapon(),
        weapons,
        null,
        TOWER_SECONDARY_SLACK_ACTIONS.HUNT_CHOOSE_WEAPON
      );
      return getGameResponse(slackBlocks);
    } else {
      const weapon = await raider._weapons![0].reload({
        include: [Trait],
      });
      return huntHelper(
        {
          interfaceName: 'TowerRaiderInteraction',
          raider,
          round,
          weapon,
        },
        transaction
      );
    }
  });
}

export async function chooseTarget(userRequesting: User, selectedTargetId: number) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    return chooseHuntTargetHelper(
      {
        interfaceName: 'TowerRaiderInteraction',
        raider,
        round,
        selectedTargetId,
      },
      transaction
    );
  });
}

export async function chooseWeapon(userRequesting: User, selectedWeaponId: number) {
  return withTowerTransaction(async (transaction) => {
    const raiderActions = await raiderActionsAlive(userRequesting, transaction);
    if (!(raiderActions as TowerRaiderInteraction).interfaceName) {
      return raiderActions as GameResponse;
    }
    const { raider, round } = raiderActions as TowerRaiderInteraction;
    const weapon = await findWeaponById(selectedWeaponId, transaction);
    if (!weapon) {
      const hud = towerCommandReply.raiderHUD(raider);
      const actionBlockkit = generateTowerActionsBlockKit(hud, towerCommandReply.weaponNotFound());
      return getGameResponse(actionBlockkit);
    }
    return huntHelper(
      {
        interfaceName: 'TowerRaiderInteraction',
        raider,
        round,
        weapon,
      },
      transaction
    );
  });
}
