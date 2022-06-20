import { get, sampleSize } from 'lodash';

import type { ArenaPlayer, Item } from '../../../../../../models';
import { TRAIT } from '../../../../../consts/global';

export function targetsPicker(
  weapon: Item,
  huntableRaiders: ArenaPlayer[],
  starterTargetPlayer?: ArenaPlayer
): {
  targets: ArenaPlayer[];
  hits: number;
} {
  let hits = 1;
  const targets: ArenaPlayer[] = [];
  const mutableHuntableEnemies: ArenaPlayer[] = [...huntableRaiders];
  const entityHuntableIndex = mutableHuntableEnemies.findIndex(
    (huntable) => huntable.id === get(starterTargetPlayer, 'id')
  );
  if (entityHuntableIndex >= 0) {
    targets.push(mutableHuntableEnemies[entityHuntableIndex]);
    mutableHuntableEnemies.splice(entityHuntableIndex, 1);
  } else {
    starterTargetPlayer = undefined;
  }

  if (weapon.hasTrait(TRAIT.BLAST_ALL)) {
    targets.push(...mutableHuntableEnemies);
  } else if (weapon.hasTrait(TRAIT.BLAST_3)) {
    const newTargets = sampleSize(mutableHuntableEnemies, 2);
    targets.push(...newTargets);
  } else if (weapon.hasTrait(TRAIT.BLAST_2)) {
    const newTargets = sampleSize(mutableHuntableEnemies, 1);
    targets.push(...newTargets);
  }

  if (!starterTargetPlayer) {
    const newTargets = sampleSize(mutableHuntableEnemies, 1);
    targets.push(...newTargets);
  }

  if (weapon.hasTrait(TRAIT.DUALSTRIKE)) {
    hits = 2;
  }

  return {
    targets,
    hits,
  };
}
