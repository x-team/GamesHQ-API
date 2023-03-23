import { random } from 'lodash';
import type { Transaction } from 'sequelize';

import type { TowerRaider } from '../../../../../../models';
import { perkImpactCalculator } from '../../../../../../models/Perk';
import { findTowerFloorById } from '../../../../../../models/TowerFloor';
import { updateLastHealth } from '../../../../../../models/TowerStatistics';
import { ONE, TRAIT, ZERO } from '../../../../../consts/global';
import { hasLuck } from '../../../../../utils';
import type { HuntPlayerParams } from '../../../../consts';
import { ENEMY_HUNT_SUCCESS_RATE } from '../../../../consts';
import { theTowerNotifyInPrivate } from '../../../../utils';
import { towerEngineReply } from '../replies';

import { evaluateInitiative } from './evaluate-initiative';
import { damageSpecsGenerator } from './generate-damage-specs';
import { targetsPicker } from './target-picker';

const huntablePlayersFilter = (huntablePlayers: TowerRaider[], canHuntHiddenPlayers?: boolean) =>
  canHuntHiddenPlayers
    ? huntablePlayers.filter((r) => r.isAlive())
    : huntablePlayers.filter((r) => r.isAlive() && r.isCurrentlyVisible());

export async function huntRaiders(
  {
    isEveryoneVisible,
    raidersToNotify,
    battlefieldEnemy: enemy,
    huntableRaiders,
  }: HuntPlayerParams,
  transaction: Transaction
) {
  // targets could be dead or hide
  await enemy.reloadFullEnemy(transaction);
  huntableRaiders = huntablePlayersFilter(huntableRaiders, enemy.hasTrait(TRAIT.DETECT));
  const isArmorBreakingAttack = !!enemy.hasTrait(TRAIT.ARMORBREAK);
  const isPiercingAttack = !!enemy.hasTrait(TRAIT.PIERCING);

  const { targets: randomTargetRaiders, hits } = targetsPicker(enemy, huntableRaiders) as {
    targets: TowerRaider[];
    hits: number;
  };

  if (huntableRaiders.length > ZERO && randomTargetRaiders.length > ZERO) {
    for (const randomTargetRaider of randomTargetRaiders) {
      for (let i = 0; i < hits; i++) {
        const generatedAbilities = perkImpactCalculator({ raider: randomTargetRaider }).toJSON();
        const evadeChanceBoost = -(randomTargetRaider.luckBoost + generatedAbilities.evadeRate);
        const hunterAccuracy = ENEMY_HUNT_SUCCESS_RATE + enemy.abilitiesJSON.accuracy;
        const isFinalHitInCombo = hits === i + ONE;

        const isLucky =
          hasLuck(hunterAccuracy, evadeChanceBoost) || enemy?.hasTrait(TRAIT.PRECISION);

        if (isLucky) {
          const originalDamage = random(
            enemy._towerFloorEnemy?._enemy?.minorDamageRate!,
            enemy._towerFloorEnemy?._enemy?.majorDamageRate!
          );
          await evaluateInitiative(
            {
              attacker: enemy,
              isRaiderAttacking: false,
              damageDelt: originalDamage,
              target: randomTargetRaider,
            },
            transaction
          );

          const damageDealtDetails = damageSpecsGenerator(
            randomTargetRaider,
            enemy,
            originalDamage,
            true,
            isPiercingAttack
          );
          const targetArmor = randomTargetRaider.itemsAvailable(randomTargetRaider._armors)[ZERO];
          let armorBreakMessage = '';

          if (targetArmor) {
            if (isArmorBreakingAttack) {
              await randomTargetRaider.removeArmor(targetArmor, transaction);

              armorBreakMessage = towerEngineReply.enemyArmorbreakOnPlayerMessage(
                enemy._towerFloorEnemy!._enemy!,
                randomTargetRaider._user!.slackId!,
                targetArmor.emoji
              );
            } else if (!isPiercingAttack) {
              await randomTargetRaider.useArmor(targetArmor, transaction);
            }
          }
          const lastHealth = randomTargetRaider.health;
          await randomTargetRaider.damageAndHide(
            damageDealtDetails.newDamage ?? damageDealtDetails.originalDamage,
            isEveryoneVisible,
            transaction
          );

          if (!randomTargetRaider.isAlive()) {
            const towerFloor = await findTowerFloorById(
              randomTargetRaider._currentTowerFloorBattlefield?._towerFloorId ?? ZERO,
              true,
              transaction
            );
            await updateLastHealth(
              towerFloor?._towerGameId ?? ZERO,
              randomTargetRaider._userId,
              towerFloor?.number ?? ZERO,
              lastHealth,
              transaction
            );
          }

          await randomTargetRaider.reloadFullInventory(transaction);

          const dealtDamageMessage = towerEngineReply.enemyDealtDamage(
            enemy,
            damageDealtDetails,
            randomTargetRaider._user!.slackId!,
            randomTargetRaider.health,
            isEveryoneVisible,
            isFinalHitInCombo,
            Boolean(isPiercingAttack && targetArmor)
          );

          await Promise.all(
            raidersToNotify.map((raider) =>
              theTowerNotifyInPrivate(dealtDamageMessage, raider._user!.slackId!)
            )
          );
          if (armorBreakMessage !== '') {
            await Promise.all(
              raidersToNotify.map((raider) =>
                theTowerNotifyInPrivate(armorBreakMessage, raider._user!.slackId!)
              )
            );
          }
        } else {
          const failedToHitMessage = towerEngineReply.enemyFailedToHit(
            enemy,
            randomTargetRaider._user!.slackId!,
            randomTargetRaider.health
          );
          await Promise.all(
            raidersToNotify.map((raider) =>
              theTowerNotifyInPrivate(failedToHitMessage, raider._user!.slackId!)
            )
          );
        }
      }
    }
  } else {
    const nobodyToHuntMessage = towerEngineReply.enemyHasNobodyToHunt(enemy);
    await Promise.all(
      raidersToNotify.map((raider) =>
        theTowerNotifyInPrivate(nobodyToHuntMessage, raider._user!.slackId!)
      )
    );
  }
}
