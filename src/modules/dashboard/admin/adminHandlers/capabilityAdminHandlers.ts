import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../../api-utils/utils';
import type { CapabilityCreateAttributes } from '../../../../models/Capability';
import {
  findAllCapabilties,
  createCapability,
  deleteCapability,
} from '../../../../models/Capability';

export const getAllCapabilitiesHandler: Lifecycle.Method = async (_, h) => {
  const capabilities = await findAllCapabilties();
  return h.response(arrayToJSON(capabilities)).code(200);
};

export const createCapabilityHandler: Lifecycle.Method = async (request, h) => {
  const data = request.payload as CapabilityCreateAttributes;
  const capability = await createCapability(data);
  return h.response(capability.toJSON()).code(200);
};

export const deleteCapabilityHandler: Lifecycle.Method = async (request, h) => {
  const rslt = await deleteCapability(request.params.capabilityId);

  if (!rslt) {
    throw Boom.notFound('capability not found');
  }

  return h.response({ success: true }).code(200);
};
