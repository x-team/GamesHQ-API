import type { Transaction } from 'sequelize';
import { ArenaRoundAction } from '../../../../../models';
import { findArenaZoneById } from '../../../../../models/ArenaZone';

export async function processChangeLocation(actions: ArenaRoundAction[], transaction: Transaction) {
  for (const action of actions) {
    const player = action._player!;
    const { locationId } = action.actionJSON;
    if (locationId) {
      const zone = await findArenaZoneById(locationId, transaction);
      await player.setPlayerZone(zone, transaction);
    }
  }
}
