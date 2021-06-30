import { ONE, ZERO } from '../../consts/global';
import { MAX_PLAYERS_PER_ARENA_ZONE } from "../consts";

export function arenaZoneCapacity(activeZonezAmount = ONE, deactivatedZonesAmount = ZERO) {
  const extraCapacity = Math.ceil(
    (deactivatedZonesAmount * MAX_PLAYERS_PER_ARENA_ZONE) / activeZonezAmount
  );
  return MAX_PLAYERS_PER_ARENA_ZONE + extraCapacity;
}
