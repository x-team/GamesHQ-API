import type { ArenaPlayer } from '../../../../../../models';

interface HuntablePlayersParams {
  huntablePlayers: ArenaPlayer[];
  isTeamBasedGame?: boolean;
  player?: ArenaPlayer;
  ignoreHiding?: boolean;
}

export function huntablePlayersFilter({
  huntablePlayers,
  isTeamBasedGame,
  player,
  ignoreHiding,
}: HuntablePlayersParams) {
  if (player) {
    return isTeamBasedGame
      ? huntablePlayers.filter(
          (p) =>
            p.id !== player.id &&
            p.isAlive() &&
            (ignoreHiding || p.isAlive()) &&
            p._teamId !== player._teamId
        )
      : huntablePlayers.filter(
          (p) => p.id !== player.id && p.isAlive() && (ignoreHiding || p.isCurrentlyVisible())
        );
  } else {
    return huntablePlayers.filter((p) => p.isAlive() && (ignoreHiding || p.isCurrentlyVisible()));
  }
}
