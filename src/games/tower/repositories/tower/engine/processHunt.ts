import type { Transaction } from 'sequelize';
import { TowerRaider, TowerRound, TowerRoundAction } from '../../../../../models';
import { findWeaponById } from '../../../../../models/ItemWeapon';
import { perkImpactCalculator } from '../../../../../models/Perk';
import { findEnemiesByFloorBattlefield } from '../../../../../models/TowerFloorBattlefieldEnemy';
import { findRaidersByFloorBattlefield } from '../../../../../models/TowerRaider';
import { Ability } from '../../../../classes/GameAbilities';
import { TRAIT } from '../../../../consts/global';
import { hasLuck } from '../../../../utils';
import { LOSE_ACTION_RATE } from '../../../consts';
import { initiativeSort, theTowerNotifyInPrivate } from '../../../utils';
import { huntEnemies } from './helpers/evaluate-hunt-enemies';
import { huntRaiders } from './helpers/evaluate-hunt-raiders';
import { towerEngineReply } from './replies';

export async function processHunt(
  round: TowerRound,
  actions: TowerRoundAction[],
  raidersToNotify: TowerRaider[],
  transaction: Transaction
) {
  // Sort actions by initiative ability
  actions = actions.sort(initiativeSort);
  const isEveryoneVisible = round.isEveryoneVisible;
  const mutableVisibleRaiders = await findRaidersByFloorBattlefield(
    round._towerFloorBattlefieldId,
    false,
    transaction
  );
  const mutableVisibleEnemies = await findEnemiesByFloorBattlefield(
    round._towerFloorBattlefieldId,
    transaction
  );

  // makes hunters and enemies visible
  await Promise.all(
    actions.map(async (action) => {
      const { weaponId } = action.actionJSON;
      const enemy = action._enemy;
      const equippedWeapon = await findWeaponById(weaponId!);

      if (!equippedWeapon?.hasTrait(TRAIT.STEALTH) && action._raider) {
        await action._raider.setVisibility(true, transaction);
        await action._raider.reloadFullInventory(transaction);
      }
      if (enemy) {
        await enemy.reloadFullEnemy(transaction);
        if (!enemy.hasTrait(TRAIT.STEALTH)) {
          await enemy.setVisibility(true, transaction);
        }
      }
    })
  );

  for (const action of actions) {
    const raider = action._raider!;
    const enemy = action._enemy;
    if (raider) {
      const previousHealth = raider.health;
      // Raider can be dead or hide from previous attack
      await raider.reloadFullInventory(transaction);
      const currentHealth = raider.health;
      const playerGotHit = currentHealth < previousHealth;
      const generatedAbilities = perkImpactCalculator({ raider }).toJSON();
      const resistStunBlockBoost = -(raider.luckBoost + generatedAbilities.stunBlockRate);
      const playerWillLoseAction = playerGotHit && hasLuck(LOSE_ACTION_RATE, resistStunBlockBoost);
      const { weaponId, targetFloorBattlefieldEnemyId } = action.actionJSON;
      const weapon = await findWeaponById(weaponId!);
      if (raider.isAlive() && !playerWillLoseAction) {
        // Raider vs Enemies
        await huntEnemies(
          {
            raider,
            floorBattlefieldId: round._towerFloorBattlefieldId,
            selectedWeaponId: weaponId,
            targetFloorBattlefieldEnemyId,
            isEveryoneVisible,
            // targets could be dead or hide
            huntableEnemies: await Promise.all(
              mutableVisibleEnemies.map((visibleEnemy) => visibleEnemy.reloadFullEnemy(transaction))
            ),
            raidersToNotify,
          },
          transaction
        );
        // Raider needs to be visible after hitting an enemy
        if (!weapon?.hasTrait(TRAIT.STEALTH)) {
          await raider.setVisibility(true, transaction);
        }
      } else {
        await theTowerNotifyInPrivate(
          towerEngineReply.raiderLostAction(raider._user!.slackId!),
          raider._user!.slackId!
        );
      }
    } else {
      const previousHealth = enemy!.health;
      // Enemy can be dead or hide from previous attack
      await enemy!.reloadFullEnemy(transaction);
      const currentHealth = enemy!.health;
      const enemyGotHit = currentHealth < previousHealth;
      const ANY_ID = -1;
      // Default raider, while we create team-based towers
      const raider = mutableVisibleRaiders.find((raider) => raider.id > ANY_ID);
      const generatedAbilities = raider
        ? perkImpactCalculator({ raider }).toJSON()
        : Ability.defaultProps();
      const resistStunBlockBoost =
        -enemy!.abilitiesJSON.stunBlockRate + generatedAbilities.stunOthersRate;
      const enemyWillLoseAction = enemyGotHit && hasLuck(LOSE_ACTION_RATE, resistStunBlockBoost);
      if (enemy?.isAlive() && !enemyWillLoseAction) {
        // Enemy vs Raider
        await huntRaiders(
          {
            battlefieldEnemy: enemy!,
            floorBattlefieldId: round._towerFloorBattlefieldId,
            isEveryoneVisible,
            // targets could be dead or hide
            huntableRaiders: await Promise.all(
              mutableVisibleRaiders.map((visibleRaider) =>
                visibleRaider.reloadFullInventory(transaction)
              )
            ),
            raidersToNotify,
          },
          transaction
        );
        // Enemy needs to be visible after hitting a raider
        if (!enemy?.hasTrait(TRAIT.STEALTH)) {
          await enemy.setVisibility(true, transaction);
        }
      } else {
        await Promise.all(
          raidersToNotify.map((raiderToNotify) =>
            theTowerNotifyInPrivate(
              towerEngineReply.enemyLostAction(enemy!._towerFloorEnemy?._enemy?.name ?? 'No name'),
              raiderToNotify._user!.slackId!
            )
          )
        );
      }
    }
    await action.completeRoundAction(transaction);
  }
}
