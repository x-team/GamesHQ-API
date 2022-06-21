import { createOrUpdateEnemy, deleteEnemyById } from '../../../../models/Enemy';
import { createEnemyPattern, existsEnemyPattern } from '../../../../models/EnemyPattern';
import { withEnemyTransaction } from '../../../arena/utils';
import type { AbilityProperty } from '../../../classes/GameAbilities';

export interface IEnemyEditorData {
  id?: number;
  name: string;
  gifUrl: string;
  emoji: string;
  abilitiesJSON: AbilityProperty;
  health: number;
  isBoss: boolean;
  majorDamageRate: number;
  minorDamageRate: number;
  actionPattern: string;
}

export const upsertEnemy = async (data: IEnemyEditorData) => {
  return withEnemyTransaction(async (transaction) => {
    const enemyPatternExists = await existsEnemyPattern(data.actionPattern, transaction);
    let enemyPatternId = data.actionPattern;
    if (!enemyPatternExists) {
      const newPattern = await createEnemyPattern(data.actionPattern);
      enemyPatternId = newPattern.id;
    }

    return createOrUpdateEnemy(
      {
        ...(data.id && { id: data.id }),
        abilitiesJSON: data.abilitiesJSON,
        emoji: data.emoji,
        gifUrl: data.gifUrl,
        name: data.name,
        health: data.health,
        isBoss: data.isBoss,
        majorDamageRate: data.majorDamageRate,
        minorDamageRate: data.minorDamageRate,
        _enemyPatternId: enemyPatternId,
      },
      transaction
    );
  });
};

export const deleteEnemy = async (enemyId: number) => {
  return withEnemyTransaction(async (transaction) => {
    return deleteEnemyById(enemyId, transaction);
  });
};
