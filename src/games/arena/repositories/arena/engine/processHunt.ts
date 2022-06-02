import type { Transaction } from 'sequelize';

import type { ArenaPlayer, ArenaRound, ArenaRoundAction } from '../../../../../models';
import { findPlayersByGame, findVisiblePlayers } from '../../../../../models/ArenaPlayer';
import { findWeaponById } from '../../../../../models/ItemWeapon';
import { SORT_ACTION_ARRAY_RATE, TRAIT } from '../../../../consts/global';
import { hasLuck } from '../../../../utils';
import { LOSE_ACTION_RATE } from '../../../consts';
import { publishArenaMessage } from '../../../utils';

import { bossHuntPlayers, playerHuntPlayers } from './evaluateHunt';
import { arenaEngineReply } from './replies';

export async function processHunt(
  round: ArenaRound,
  actions: ArenaRoundAction[],
  transaction: Transaction
) {
  let mutableVisiblePlayers: ArenaPlayer[];
  const isEveryoneVisible = round.isEveryoneVisible;
  const allPlayers = await findPlayersByGame(round._gameId, false, transaction);
  if (isEveryoneVisible) {
    // Find all, ignoring visibility
    mutableVisiblePlayers = allPlayers;
  } else {
    // makes hunters visible
    await Promise.all(
      actions.map(async (action) => {
        const { weaponId } = action.actionJSON;
        if (weaponId) {
          const weapon = await findWeaponById(weaponId);
          if (weapon && !weapon?.hasTrait(TRAIT.STEALTH)) {
            await action._player?.setVisibility(true, transaction);
          }
        }
      })
    );
    mutableVisiblePlayers = await findVisiblePlayers(round._gameId, false, transaction);
  }

  const charactersActions: Array<ArenaRoundAction> = [...actions];
  charactersActions.sort(() => (Math.random() < SORT_ACTION_ARRAY_RATE ? 1 : -1));

  for (let mutableAction of charactersActions) {
    mutableAction = mutableAction as ArenaRoundAction;
    const player = mutableAction._player!;
    const previousHealth = player.health;
    // Player can be dead or hide from previous attack
    await player.reloadFullInventory(transaction);
    const currentHealth = player.health;
    const playerGotHit = currentHealth < previousHealth;
    const resistStunBlockBoost = -(player.abilitiesJSON.stunBlockRate + player.luckBoost);
    const playerWillLoseAction = playerGotHit && hasLuck(LOSE_ACTION_RATE, resistStunBlockBoost);
    const { weaponId, targetPlayerId } = mutableAction.actionJSON;
    if (player.isAlive() && !playerWillLoseAction) {
      if (player.isBoss) {
        // Boss vs Player
        await bossHuntPlayers({
          player,
          gameId: round._gameId,
          selectedWeaponId: weaponId,
          targetPlayerId,
          isEveryoneVisible,
          // targets could be dead or hide
          huntablePlayers: await Promise.all(
            mutableVisiblePlayers.map((visiblePlayer) =>
              visiblePlayer.reloadFullInventory(transaction)
            )
          ),
          transaction,
        });
      } else {
        // Player vs Player
        const weapon = await findWeaponById(weaponId!);
        const huntablePlayers = weapon?.hasTrait(TRAIT.DETECT) ? allPlayers : mutableVisiblePlayers;
        await playerHuntPlayers({
          player,
          gameId: round._gameId,
          selectedWeaponId: weaponId,
          isTeamBasedGame: !!round._game?._arena?.teamBased,
          targetPlayerId,
          isEveryoneVisible,
          // targets could be dead or hide
          huntablePlayers: await Promise.all(
            huntablePlayers.map((visiblePlayer) => visiblePlayer.reloadFullInventory(transaction))
          ),
          transaction,
        });
      }
    } else {
      const isDead = !player.isAlive();
      await publishArenaMessage(arenaEngineReply.playerLostAction(player._user!.slackId!, isDead));
    }
    await mutableAction.completeRoundAction(transaction);
  }
}
