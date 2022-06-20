import type { TowerFloor, TowerFloorBattlefieldEnemy, TowerRaider } from '../../../models';
import { PLAYER_HIDE_EMOJI, PLAYER_VISIBLE_EMOJI } from '../../consts/emojis';
import { ZERO } from '../../consts/global';
import {
  armorStatus,
  generateHealthBar,
  healthKitStatus,
  initiativeStatus,
  perkStatus,
  weaponStatus,
} from '../../helpers';
import { MAX_RAIDER_HEALTH } from '../consts';

export function raiderStatus(raider: TowerRaider) {
  const { health, isVisible, _weapons, _healthkits, _armors, _perks, abilitiesJSON } = raider;
  return (
    `${generateHealthBar(MAX_RAIDER_HEALTH, health)}\n` +
    `${weaponStatus(_weapons ?? [])}\n` +
    `${armorStatus(_armors ?? [])}\n` +
    `${healthKitStatus(_healthkits ?? [])}\n` +
    `${initiativeStatus(abilitiesJSON.initiative)}\n` +
    `${perkStatus(_perks!)}\n` +
    `${isVisible ? PLAYER_VISIBLE_EMOJI : PLAYER_HIDE_EMOJI} *Visibility:* ${
      isVisible ? '_Visible_' : '_Not Visible_'
    }`
  );
}

export function enemyStatus(enemy: TowerFloorBattlefieldEnemy) {
  const enemyMaxHealth = enemy._towerFloorEnemy?._enemy?.health ?? ZERO;
  return (
    `\t${enemy._towerFloorEnemy?._enemy?.emoji} ` +
    `*${enemy._towerFloorEnemy?._enemy?.name}* ` +
    `*[* ${
      enemy.isVisible ? `${PLAYER_VISIBLE_EMOJI} _Visible_` : `${PLAYER_HIDE_EMOJI} _Not Visible_`
    } *]*\n` +
    `\t${generateHealthBar(enemyMaxHealth, enemy.health)}`
  );
}

export function raiderFullProgress(
  raider: TowerRaider,
  floor: TowerFloor,
  enemies: TowerFloorBattlefieldEnemy[]
) {
  return (
    `*RAIDER'S PROGRESS*\n` +
    `*Current Floor:* ${floor.number} *|* ${
      floor.isEveryoneVisible
        ? `_You *can't* hide on this floor_`
        : `_You *can* hide on this floor_`
    }\n\n` +
    `${raiderStatus(raider)}\n\n` +
    `*Enemies*\n` +
    `${enemies.map(enemyStatus).join('\n')}\n\n`
  );
}

export function raiderBasicCharactersProgress(
  raider: TowerRaider,
  enemies: TowerFloorBattlefieldEnemy[]
) {
  return (
    `*You* *[* ${
      raider.isVisible ? `${PLAYER_VISIBLE_EMOJI} _Visible_` : `${PLAYER_HIDE_EMOJI} _Not Visible_`
    } *]*\n` +
    `\t${generateHealthBar(MAX_RAIDER_HEALTH, raider.health)}\n\n\n` +
    `*Enemies*\n` +
    `${enemies.map(enemyStatus).join('\n')}\n`
  );
}
