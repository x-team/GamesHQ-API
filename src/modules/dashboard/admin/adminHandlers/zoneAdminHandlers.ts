import type { Lifecycle } from '@hapi/hapi';

import type { IZoneEditorData } from '../../../../games/tower/repositories/arena/zonesRepository';
import { deleteZone, upsertZone } from '../../../../games/tower/repositories/arena/zonesRepository';
import { findAllArenaZones, findArenaZoneById } from '../../../../models/ArenaZone';

export const getZoneHandler: Lifecycle.Method = async (_request, h) => {
  const zone = await findArenaZoneById(_request.params.zoneId);

  return h.response({ zone }).code(200);
};

export const getZonesHandler: Lifecycle.Method = async (_request, h) => {
  const zones = await findAllArenaZones();
  return h.response({ zones }).code(200);
};

export const upsertZoneHandler: Lifecycle.Method = async (_request, h) => {
  const { payload } = _request;
  const zoneCreationData = payload as IZoneEditorData;
  await upsertZone(zoneCreationData);

  return h.response({ success: true }).code(200);
};

export const deleteZoneHandler: Lifecycle.Method = async (_request, h) => {
  await deleteZone(_request.params.zoneId);
  return h.response({}).code(200);
};
