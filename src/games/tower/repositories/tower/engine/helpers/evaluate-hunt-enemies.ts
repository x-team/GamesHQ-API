import { random } from 'lodash';
import type { Transaction } from 'sequelize';
import { Item, TowerFloorBattlefieldEnemy } from '../../../../../../models';
import { perkImpactCalculator } from '../../../../../../models/Perk';
import { TRAIT, ZERO } from '../../../../../consts/global';
import { hasLuck } from '../../../../../utils';
import { HuntEnemyParams, HUNT_SUCCESS_RATE } from '../../../../consts';
import { theTowerNotifyInPrivate } from '../../../../utils';
import { towerEngineReply } from '../replies';
import { evaluateInitiative } from './evaluate-initiative';
import { damageSpecsGenerator } from './generate-damage-specs';
import { targetsPicker } from './target-picker';

const huntableEnemiesFilter = (
  huntableEnemies: TowerFloorBattlefieldEnemy[],
  canHuntHiddenEnemies?: boolean
) =>
  canHuntHiddenEnemies
    ? huntableEnemies.filter((e) => e.isAlive())
    : huntableEnemies.filter((e) => e.isAlive() && e.isCurrentlyVisible());

export async function huntEnemies(
  {
    raidersToNotify,
    raider,
    selectedWeaponId,
    targetFloorBattlefieldEnemyId,
    huntableEnemies,
    isEveryoneVisible,
  }: HuntEnemyParams,
  transaction: Transaction
) {
  // targets could be dead or hide
  const weapon = raider._weapons!.find((w) => w.id === selectedWeaponId)!;
  await weapon.reload({
    include: [Item.associations._weapon, Item.associations._traits],
    transaction,
  });

  const isArmorBreakingAttack = !!weapon.hasTrait(TRAIT.ARMORBREAK);
  const isPiercingAttack = !!weapon.hasTrait(TRAIT.PIERCING);
  huntableEnemies = huntableEnemiesFilter(huntableEnemies, weapon.hasTrait(TRAIT.DETECT));
  if (huntableEnemies.length > ZERO) {
    await raider.useWeapon(weapon, transaction);
    const { targets, hits } = targetsPicker(
      weapon,
      huntableEnemies,
      targetFloorBattlefieldEnemyId
    ) as { targets: TowerFloorBattlefieldEnemy[]; hits: number };
    if (targets.length > 1) {
      await Promise.all(
        raidersToNotify.map((raiderToNotify) =>
          theTowerNotifyInPrivate(
            towerEngineReply.weaponBlastDamage(),
            raiderToNotify._user!.slackId!
          )
        )
      );
    }
    const mutableDamage: number | null = null;
    for (const targetEnemy of targets) {
      for (let i = 0; i < hits; i++) {
        if (!targetEnemy.isAlive()) {
          return;
        }

        const generatedAbilities = perkImpactCalculator({ raider }).toJSON();
        const enemyEvadeChanceBoost = raider.luckBoost - targetEnemy.abilitiesJSON.evadeRate;
        const hunterAccuracy = HUNT_SUCCESS_RATE + generatedAbilities.accuracy;
        const attackSuccessful =
          hasLuck(hunterAccuracy, enemyEvadeChanceBoost) || weapon?.hasTrait(TRAIT.PRECISION);
        const isFinalHitInCombo = hits === i + 1;

        if (attackSuccessful) {
          const towerEnemyRef = targetEnemy._towerFloorEnemy?._enemy!;
          const enemyHasDefenseRate = targetEnemy.abilitiesJSON.defenseRate > ZERO;

          const originalDamage =
            mutableDamage ??
            random(
              weapon._weapon?.minorDamageRate ?? ZERO,
              weapon._weapon?.majorDamageRate ?? ZERO
            );
          await evaluateInitiative(
            {
              attacker: raider,
              weapon,
              isRaiderAttacking: true,
              damageDelt: originalDamage,
              target: targetEnemy,
            },
            transaction
          );
          const damageDealtDetails = damageSpecsGenerator(
            raider,
            targetEnemy,
            originalDamage,
            false,
            isPiercingAttack
          );
          await targetEnemy.damageAndHide(
            damageDealtDetails.newDamage ?? damageDealtDetails.originalDamage,
            isEveryoneVisible,
            transaction
          );
          await targetEnemy.reloadFullEnemy(transaction);
          const raiderDealtDamageMessage = towerEngineReply.raiderDealtDamageToEnemy(
            raider._user?.slackId!,
            raider.health,
            damageDealtDetails,
            weapon.emoji,
            targetEnemy,
            isEveryoneVisible,
            isFinalHitInCombo,
            isPiercingAttack && enemyHasDefenseRate
          );
          await Promise.all(
            raidersToNotify.map((raiderToNotify) =>
              theTowerNotifyInPrivate(raiderDealtDamageMessage, raiderToNotify._user!.slackId!)
            )
          );

          let armorBreakMessage = '';
          if (enemyHasDefenseRate && isArmorBreakingAttack) {
            await targetEnemy.breakArmor(transaction);
            armorBreakMessage = towerEngineReply.playerArmorbreakOnEnemy(
              towerEnemyRef,
              raider._user!.slackId!
            );
          }

          if (armorBreakMessage !== '') {
            await Promise.all(
              raidersToNotify.map((raider) =>
                theTowerNotifyInPrivate(armorBreakMessage, raider._user!.slackId!)
              )
            );
          }
        } else {
          const raiderFailedToHitMessage = towerEngineReply.raiderFailedToHitEnemy(
            raider._user!.slackId!,
            raider.health,
            weapon.emoji,
            targetEnemy
          );
          await Promise.all(
            raidersToNotify.map((raiderToNotify) =>
              theTowerNotifyInPrivate(raiderFailedToHitMessage, raiderToNotify._user!.slackId!)
            )
          );
        }
      }
    }
  } else {
    const nobodyToHuntMessage = towerEngineReply.raiderHasNobodyToHunt(
      raider._user?.slackId!,
      weapon.emoji
    );
    await Promise.all(
      raidersToNotify.map((raiderToNotify) =>
        theTowerNotifyInPrivate(nobodyToHuntMessage, raiderToNotify._user!.slackId!)
      )
    );
  }
}
