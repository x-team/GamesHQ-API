import type { Lifecycle } from '@hapi/hapi';

import type { IEnemyEditorData } from '../../../../games/tower/repositories/tower/enemyRepository';
import {
  deleteEnemy,
  upsertEnemy,
} from '../../../../games/tower/repositories/tower/enemyRepository';
import { findAllEnemies, findEnemyById } from '../../../../models/Enemy';

export const getEnemyHandler: Lifecycle.Method = async (_request, h) => {
  const enemy = await findEnemyById(_request.params.enemyId);

  return h
    .response({
      enemy,
    })
    .code(200);
};

export const getEnemiesHandler: Lifecycle.Method = async (_request, h) => {
  const enemies = await findAllEnemies();

  return h.response({ enemies }).code(200);
};

export const upsertEnemyHandler: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const enemyCreationData = payload as IEnemyEditorData;
  await upsertEnemy(enemyCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteEnemyHandler: Lifecycle.Method = async (_request, h) => {
  await deleteEnemy(_request.params.enemyId);

  return h
    .response({
      success: true,
    })
    .code(200);
};
