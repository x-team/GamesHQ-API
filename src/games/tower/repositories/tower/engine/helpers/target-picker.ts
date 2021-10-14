import { sampleSize } from 'lodash';
import { Item, TowerFloorBattlefieldEnemy, TowerRaider } from '../../../../../../models';
import { ONE, TRAIT, TWO, ZERO } from '../../../../../consts/global';

type HuntableEntity = TowerFloorBattlefieldEnemy | TowerRaider;

export function targetsPicker(
  weaponOrEnemy: Item | TowerFloorBattlefieldEnemy,
  huntableEnemies: HuntableEntity[],
  initialHuntableId?: number | null
): {
  targets: HuntableEntity[];
  hits: number;
} {
  let hits = 1;
  const targets: HuntableEntity[] = [];
  let mutableHuntableEnemies: HuntableEntity[] = [...huntableEnemies];
  const entityHuntableIndex = mutableHuntableEnemies.findIndex(
    (huntable) => huntable.id === initialHuntableId
  );
  if (entityHuntableIndex >= ZERO) {
    targets.push(mutableHuntableEnemies[entityHuntableIndex]);
    mutableHuntableEnemies.splice(entityHuntableIndex, ONE);
  } else {
    // Initial huntable id was invalid
    initialHuntableId = null;
  }

  const deletePossibleTargets = (huntableTarget: HuntableEntity) => {
    const entityTargetableIndex = mutableHuntableEnemies.findIndex(
      (huntable) => huntable.id === huntableTarget.id
    );
    if (entityTargetableIndex >= ZERO) {
      mutableHuntableEnemies.splice(entityHuntableIndex, ONE);
    }
  };

  if (weaponOrEnemy.hasTrait(TRAIT.BLAST_ALL)) {
    targets.push(...mutableHuntableEnemies);
    mutableHuntableEnemies = [];
  } else if (weaponOrEnemy.hasTrait(TRAIT.BLAST_3)) {
    const newTargets = sampleSize(mutableHuntableEnemies, TWO);
    targets.push(...newTargets);
    newTargets.forEach(deletePossibleTargets);
  } else if (weaponOrEnemy.hasTrait(TRAIT.BLAST_2)) {
    const newTargets = sampleSize(mutableHuntableEnemies, ONE);
    targets.push(...newTargets);
    newTargets.forEach(deletePossibleTargets);
  }

  if (!initialHuntableId) {
    const newTargets = sampleSize(mutableHuntableEnemies, ONE);
    targets.push(...newTargets);
  }

  if (weaponOrEnemy.hasTrait(TRAIT.DUALSTRIKE)) {
    hits = 2;
  }

  return {
    targets,
    hits,
  };
}
