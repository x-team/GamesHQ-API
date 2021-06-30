import { MAX_PLAYERS_PER_ARENA_ZONE } from "../consts";

export function arenaZoneCapacity(activeZonezAmount = 1, deactivatedZonesAmount = 0) {
  const extraCapacity = Math.ceil(
    (deactivatedZonesAmount * MAX_PLAYERS_PER_ARENA_ZONE) / activeZonezAmount
  );
  return MAX_PLAYERS_PER_ARENA_ZONE + extraCapacity;
}
