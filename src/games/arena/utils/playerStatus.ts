import type { ArenaPlayer } from '../../../models';
import { PLAYER_HIDE_EMOJI, PLAYER_VISIBLE_EMOJI } from '../../consts/emojis';
import {
  armorStatus,
  cheerSystemStatus,
  generateHealthBar,
  healthKitStatus,
  weaponStatus,
  zoneStatus,
} from '../../helpers';
import { MAX_BOSS_HEALTH, MAX_PLAYER_HEALTH } from '../consts';

export function playerStatus(player: ArenaPlayer, cheersAmount?: number) {
  const { health, isVisible, _weapons, _healthkits, _armors, _zone } = player;
  return (
    `${zoneStatus(_zone!)}\n` +
    `${generateHealthBar(player.isBoss ? MAX_BOSS_HEALTH : MAX_PLAYER_HEALTH, health)}\n` +
    `${weaponStatus(_weapons ?? [])}\n` +
    `${armorStatus(_armors ?? [])}\n` +
    `${healthKitStatus(_healthkits ?? [])}\n` +
    `${isVisible ? PLAYER_VISIBLE_EMOJI : PLAYER_HIDE_EMOJI} *Visibility:* ${
      isVisible ? '_Visible_' : '_Not Visible_'
    }\n` +
    `${cheerSystemStatus(cheersAmount)}`
  );
}
