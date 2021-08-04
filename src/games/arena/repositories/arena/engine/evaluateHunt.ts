import { random } from 'lodash';
import type { Transaction } from 'sequelize';
import { ArenaPlayer } from '../../../../../models';
import { findPlayerById } from '../../../../../models/ArenaPlayer';
import {
  findFirstBlood,
  setFirstBlood,
  setPlayerPerformanceAction,
} from '../../../../../models/ArenaPlayerPerformance';
import { TRAIT, ZERO } from '../../../../consts/global';
import { damageIncrease, damageReduction, hasLuck } from '../../../../utils';
import {
  ADRENALINE_THRESHOLD,
  ARENA_PLAYER_PERFORMANCE,
  BOSS_HUNT_SUCCESS_RATE,
  BOSS_MAJOR_DAMAGE,
  BOSS_MINOR_DAMAGE,
  HUNT_SUCCESS_RATE,
  INSTANT_KILL_RATE,
  MAX_PLAYER_HEALTH,
} from '../../../consts';
import { publishArenaMessage } from '../../../utils';
import { aggressiveLoot } from './evaluateHuntHelpers/aggressiveLoot';
import { huntablePlayersFilter } from './evaluateHuntHelpers/huntablePlayersFilter';
import { targetsPicker } from './evaluateHuntHelpers/targetsPicker';
import { gameEngineReply } from './replies';

interface HuntParams {
  player: ArenaPlayer;
  gameId: number;
  selectedWeaponId?: number | null;
  transaction: Transaction;
}

interface HuntPlayerParams extends HuntParams {
  targetPlayerId?: number | null;
  isEveryoneVisible: boolean;
  huntablePlayers: ArenaPlayer[];
  isTeamBasedGame?: boolean;
}

export async function playerHuntPlayers({
  player,
  gameId,
  selectedWeaponId,
  huntablePlayers,
  isTeamBasedGame,
  isEveryoneVisible,
  targetPlayerId,
  transaction,
}: HuntPlayerParams) {
  const weapon = player ? player._weapons?.find((w) => w.id === selectedWeaponId) : null;
  if (!weapon) {
    return;
  }
  const ignoreHiding = weapon.hasTrait(TRAIT.DETECT);
  huntablePlayers = huntablePlayersFilter({
    isTeamBasedGame,
    huntablePlayers,
    player,
    ignoreHiding,
  });
  const isArmorBreakingAttack = weapon.hasTrait(TRAIT.ARMORBREAK);
  const isArmorPiercingAttack = !!weapon.hasTrait(TRAIT.PIERCING);

  if (huntablePlayers.length > 0) {
    let mutableTargets: ArenaPlayer[] = [];
    let mutableHits = 1;

    const targetPlayerFound = huntablePlayers.find((p) => p.id === targetPlayerId);
    if (!targetPlayerFound) {
      const deadOrHidePlayerFound = (await findPlayerById(
        targetPlayerId ?? ZERO,
        false,
        transaction
      ))!;
      const isDead = !deadOrHidePlayerFound.isAlive();
      await publishArenaMessage(
        gameEngineReply.targetPlayerIsDeadOrHide(
          player._user?.slackId!,
          deadOrHidePlayerFound._user?.slackId!,
          isDead
        )
      );
    }

    if (targetPlayerFound) {
      const { targets, hits } = targetsPicker(weapon, huntablePlayers, targetPlayerFound);
      mutableTargets = targets;
      mutableHits = hits;
      await player.useWeapon(weapon, transaction);

      if (targets.length >= 2) {
        const blastDamageMessage = gameEngineReply.weaponBlastDamage();
        await publishArenaMessage(blastDamageMessage);
      }
    }
    let mutableOriginalDamage = 0;

    for (const target of mutableTargets) {
      for (let i = 0; i < mutableHits; i++) {
        if (!target.isAlive()) {
          return;
        }

        const accuracyBoost = (player?.luckBoost ?? 0) + (player?.abilitiesJSON.accuracy ?? 0);
        const isLucky =
          hasLuck(HUNT_SUCCESS_RATE - target.abilitiesJSON.evadeRate, accuracyBoost) ||
          weapon.hasTrait(TRAIT.PRECISION);
        if (isLucky) {
          mutableOriginalDamage =
            random(
              weapon._weapon?.minorDamageRate ?? ZERO,
              weapon._weapon?.majorDamageRate ?? ZERO
            ) + player.abilitiesJSON.flatAttackBonus;
          const targetArmor = target.itemsAvailable(target._armors).pop();

          const hasArmorReduction = Boolean(targetArmor) && !isArmorPiercingAttack;

          const reductionRate = hasArmorReduction
            ? targetArmor?._armor?.reductionRate ?? ZERO
            : ZERO;

          let mutableDeltaDamageIncrease = 0;
          if (player?.health! <= ADRENALINE_THRESHOLD) {
            const playerAttackRate = player?.abilitiesJSON.attackRate ?? 0;
            const ratePerHP = playerAttackRate / ADRENALINE_THRESHOLD;
            const adrenalineIncreaseRate = playerAttackRate - player?.health! * ratePerHP;
            mutableDeltaDamageIncrease = damageIncrease(
              mutableOriginalDamage,
              adrenalineIncreaseRate
            );
          }

          const originalDamageAndIncrease = mutableOriginalDamage + mutableDeltaDamageIncrease;
          const dealtDamageReduction = targetArmor
            ? damageReduction(originalDamageAndIncrease, reductionRate)
            : ZERO;
          const newDealtDamage = hasArmorReduction
            ? originalDamageAndIncrease -
              target.abilitiesJSON.flatDefenseBonus -
              dealtDamageReduction
            : originalDamageAndIncrease - target.abilitiesJSON.flatDefenseBonus;

          await target.damageAndHide(newDealtDamage, isEveryoneVisible, transaction);
          const armorSpecs =
            hasArmorReduction && targetArmor
              ? {
                  damageDealt: newDealtDamage,
                  rarity: targetArmor._itemRarityId,
                  damageReductionRate: reductionRate,
                  emoji: targetArmor.emoji,
                }
              : null;
          const dealtDamageMessage = gameEngineReply.playerDealtDamage(
            player._user?.slackId!,
            player.health,
            originalDamageAndIncrease,
            weapon.emoji,
            target._user!.slackId!,
            target.health,
            isEveryoneVisible,
            armorSpecs,
            isArmorPiercingAttack
          );
          await publishArenaMessage(dealtDamageMessage);

          if (isArmorBreakingAttack && targetArmor) {
            await target.removeArmor(targetArmor, transaction);
            await publishArenaMessage(
              gameEngineReply.playerArmorBrokenByArmorbreakingTrait(
                target._user!.slackId!,
                weapon.emoji,
                targetArmor.emoji
              )
            );
          }

          await setPlayerPerformanceAction(
            player.id,
            gameId,
            { field: ARENA_PLAYER_PERFORMANCE.DAMAGE_DEALT, value: newDealtDamage },
            transaction
          );

          if (target.health === 0) {
            const firstBlood = await findFirstBlood(gameId, transaction);
            if (!firstBlood) {
              await setFirstBlood(player.id, gameId, transaction);
            }
            await setPlayerPerformanceAction(
              player.id,
              gameId,
              { field: ARENA_PLAYER_PERFORMANCE.KILLS, value: 1 },
              transaction
            );
            await aggressiveLoot({ killerPlayer: player, deadPlayer: target }, transaction);
          }
        } else {
          const failedToHitMessage = gameEngineReply.playerFailedToHit(
            player._user!.slackId!,
            player.health,
            weapon.emoji,
            target._user!.slackId!,
            target.health
          );
          await publishArenaMessage(failedToHitMessage);
        }
      }
    }
  } else {
    const nobodyToHuntMessage = gameEngineReply.playerHasNobodyToHunt(
      player._user!.slackId!,
      weapon.emoji
    );
    await publishArenaMessage(nobodyToHuntMessage);
  }
}

export async function bossHuntPlayers({
  player,
  gameId,
  huntablePlayers,
  isEveryoneVisible,
  targetPlayerId,
  transaction,
}: HuntPlayerParams) {
  const boss = player;
  huntablePlayers = huntablePlayersFilter({
    huntablePlayers,
    player: boss,
  });

  if (huntablePlayers.length > 0) {
    let mutableRandomTargetPlayers: ArenaPlayer[] = [];

    const targetPlayerFound = huntablePlayers.find((p) => p.id === targetPlayerId);
    if (!targetPlayerFound) {
      const deadOrHidePlayerFound = (await findPlayerById(targetPlayerId!, false, transaction))!;
      const isDead = !deadOrHidePlayerFound.isAlive();
      await publishArenaMessage(
        gameEngineReply.targetPlayerIsDeadOrHide(
          boss._user?.slackId!,
          deadOrHidePlayerFound._user?.slackId!,
          isDead
        )
      );
    }

    if (targetPlayerFound) {
      mutableRandomTargetPlayers = [targetPlayerFound];
    }

    let mutableOriginalDamage = 0;

    for (const randomTargetPlayer of mutableRandomTargetPlayers) {
      const accuracyBoost = (boss?.luckBoost ?? 0) + (boss?.abilitiesJSON.accuracy ?? 0);
      const isLucky = hasLuck(
        BOSS_HUNT_SUCCESS_RATE - randomTargetPlayer.abilitiesJSON.evadeRate,
        accuracyBoost
      );
      if (isLucky) {
        const instantKill = hasLuck(INSTANT_KILL_RATE);
        mutableOriginalDamage = instantKill
          ? MAX_PLAYER_HEALTH
          : random(BOSS_MINOR_DAMAGE, BOSS_MAJOR_DAMAGE) + boss.abilitiesJSON.flatAttackBonus;
        const targetArmor = randomTargetPlayer.itemsAvailable(randomTargetPlayer._armors).pop();

        const reductionRate = targetArmor?._armor ? targetArmor._armor.reductionRate : ZERO;

        let mutableDeltaDamageIncrease = 0;
        if (boss?.health! <= ADRENALINE_THRESHOLD) {
          const playerAttackRate = boss?.abilitiesJSON.attackRate ?? 0;
          const ratePerHP = playerAttackRate / ADRENALINE_THRESHOLD;
          const adrenalineIncreaseRate = playerAttackRate - boss?.health! * ratePerHP;
          mutableDeltaDamageIncrease = damageIncrease(
            mutableOriginalDamage,
            adrenalineIncreaseRate
          );
        }

        const originalDamageAndIncrease = mutableOriginalDamage + mutableDeltaDamageIncrease;
        const dealtDamageReduction = targetArmor
          ? damageReduction(originalDamageAndIncrease, reductionRate)
          : 0;
        const newDealtDamage = targetArmor
          ? originalDamageAndIncrease -
            randomTargetPlayer.abilitiesJSON.flatDefenseBonus -
            dealtDamageReduction
          : originalDamageAndIncrease - randomTargetPlayer.abilitiesJSON.flatDefenseBonus;

        if (targetArmor) {
          await randomTargetPlayer.useArmor(targetArmor, transaction);
        }

        await randomTargetPlayer.damageAndHide(newDealtDamage, isEveryoneVisible, transaction);
        const armorSpecs = targetArmor
          ? {
              damageDealt: newDealtDamage,
              rarity: targetArmor._itemRarityId,
              damageReductionRate: reductionRate,
              emoji: targetArmor.emoji,
            }
          : null;
        const dealtDamageMessage = gameEngineReply.bossDealtDamage(
          boss._user?.slackId!,
          boss.health,
          originalDamageAndIncrease,
          randomTargetPlayer._user!.slackId!,
          randomTargetPlayer.health,
          isEveryoneVisible,
          armorSpecs
        );

        await publishArenaMessage(dealtDamageMessage);

        await setPlayerPerformanceAction(
          boss.id,
          gameId,
          { field: ARENA_PLAYER_PERFORMANCE.DAMAGE_DEALT, value: newDealtDamage },
          transaction
        );

        if (randomTargetPlayer.health === 0) {
          const firstBlood = await findFirstBlood(gameId, transaction);
          if (!firstBlood) {
            await setFirstBlood(boss.id, gameId, transaction);
          }
          await setPlayerPerformanceAction(
            boss.id,
            gameId,
            { field: ARENA_PLAYER_PERFORMANCE.KILLS, value: 1 },
            transaction
          );
        }
      } else {
        const failedToHitMessage = gameEngineReply.bossFailedToHit(
          boss._user!.slackId!,
          boss.health,
          randomTargetPlayer._user!.slackId!,
          randomTargetPlayer.health
        );
        await publishArenaMessage(failedToHitMessage);
      }
    }
  } else {
    const nobodyToHuntMessage = gameEngineReply.bossHasNobodyToHunt(boss._user!.slackId!);
    await publishArenaMessage(nobodyToHuntMessage);
  }
}
