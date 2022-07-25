import Boom from '@hapi/boom';
import type { Lifecycle } from '@hapi/hapi';

import { arenaSwitchCommand } from '../../../../games/arena/commands';
import { ARENA_DASHBOARD_COMMANDS } from '../../../../games/arena/consts';
import type { User } from '../../../../models';
import { ArenaPlayer, Item } from '../../../../models';
import { ArenaGame, findActiveArenaGame } from '../../../../models/ArenaGame';

type ICommandArena = {
  command: string;
};

export const getCurrentArenaGameState: Lifecycle.Method = async (_request, h) => {
  const activeGame = await findActiveArenaGame();

  await activeGame?.reload({
    include: [
      {
        model: ArenaGame,
      },
      {
        model: ArenaPlayer,
        include: [
          {
            association: ArenaPlayer.associations._weapons,
            include: [Item.associations._weapon, Item.associations._traits],
            as: '_weapons',
          },
        ],
      },
    ],
  });

  return h.response({ arenaGame: activeGame }).code(200);
};

export const commandArenaHandler: Lifecycle.Method = async (_request, h) => {
  const authUser = _request.pre.getAuthUser as User;
  const payload = _request.payload as ICommandArena;

  if (!ARENA_DASHBOARD_COMMANDS.includes(payload.command)) {
    throw Boom.notFound(
      `invalid arena command. Following commands are allowed: ${ARENA_DASHBOARD_COMMANDS}`
    );
  }

  const params = {
    commandText: '',
    userRequesting: authUser,
    channelId: '',
    triggerId: '',
    ...payload,
  };

  const rslt = await arenaSwitchCommand(params);

  if (!rslt) {
    return h.response({ success: true }).code(200);
  }

  return h
    .response({
      message: rslt.text,
    })
    .code(200);
};
