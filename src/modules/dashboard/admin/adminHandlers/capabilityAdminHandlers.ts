import type { Lifecycle } from '@hapi/hapi';

import { arrayToJSON } from '../../../../api-utils/utils';
import { findAllCapabilties } from '../../../../models/Capability';

export const getAllCapabilitiesHandler: Lifecycle.Method = async (_, h) => {
  const capabilities = await findAllCapabilties();
  return h.response(arrayToJSON(capabilities)).code(200);
};
