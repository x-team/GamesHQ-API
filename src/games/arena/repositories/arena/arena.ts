import { logger } from '../../../../config';
import { User } from '../../../../models';
import { startArenaGame } from '../../../../models/ArenaGame';
import { activateAllArenaZones } from '../../../../models/ArenaZone';
import { enableAllItems } from '../../../../models/GameItemAvailability';
import { GAME_TYPE } from '../../../consts/global';
import {
  adminAction,
  GameResponse,
  generateRandomNameForGame,
  getGameError,
  getGameResponse,
} from '../../../utils';
import { withArenaTransaction } from '../../utils';
import { ArenaEngine } from './engine';
import { arenaCommandReply } from './replies';

export class ArenaRepository {
  readonly name: string = 'arena-repository';
  constructor(public arenaGameEngine: ArenaEngine) {}
  // PLAYERS ///////////////////////////////////////////////////////////////////

  // ADMINS ///////////////////////////////////////////////////////////////////
  async newGame(commandText: string, userRequesting: User): Promise<void | GameResponse> {
    return withArenaTransaction(async (transaction) => {
      logger.debug('hello here');
      const isAdmin = adminAction(userRequesting);
      if (!isAdmin) {
        return getGameError(arenaCommandReply.adminsOnly());
      }
      try {
        logger.debug('hello here 2');
        const teamBasedText = 'team based';
        const teamBasedTextNoSpaces = teamBasedText.replace(' ', '');
        const lowerCaseCommandText = commandText.toLowerCase();
        const isTeamBased =
          lowerCaseCommandText.includes(teamBasedText) ||
          lowerCaseCommandText.includes(teamBasedTextNoSpaces);
        const gameName = lowerCaseCommandText
          .replace(teamBasedText, '')
          .replace(teamBasedTextNoSpaces, '')
          .trim();
        const game = await startArenaGame(
          {
            name: gameName === '' ? generateRandomNameForGame(GAME_TYPE.ARENA) : gameName,
            _createdById: userRequesting.id,
            teamBased: isTeamBased,
          },
          transaction
        );

        await enableAllItems(game.id, transaction);
        await activateAllArenaZones(transaction);
        return getGameResponse(arenaCommandReply.adminCreatedGame(game));
      } catch (e) {
        logger.error('Hello error :D');
        throw e;
        // throw GameError({
        //   message: e.message,
        //   repository: ArenaRepository.name,
        // })
      }
    });
  }
}
