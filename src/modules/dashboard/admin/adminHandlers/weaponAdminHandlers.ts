import type { Lifecycle } from '@hapi/hapi';

import type { IWeaponEditorData } from '../../../../games/tower/repositories/universal/weaponRepository';
import {
  deleteWeapon,
  upsertWeapon,
} from '../../../../games/tower/repositories/universal/weaponRepository';
import { listAllWeapons } from '../../../../models/Item';
import { findWeaponById } from '../../../../models/ItemWeapon';

export const getWeaponsHandler: Lifecycle.Method = async (_request, h) => {
  const weapons = await listAllWeapons();
  return h.response({ weapons }).code(200);
};

export const getWeaponHandler: Lifecycle.Method = async (_request, h) => {
  const weapon = await findWeaponById(_request.params.weaponId);

  return h
    .response({
      weapon,
    })
    .code(200);
};

export const upsertWeaponHandler: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const weaponCreationData = payload as IWeaponEditorData;
  await upsertWeapon(weaponCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteWeaponHandler: Lifecycle.Method = async (_request, h) => {
  await deleteWeapon(_request.params.itemId);
  return h.response({ success: true }).code(200);
};
