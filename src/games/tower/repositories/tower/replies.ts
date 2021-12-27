import { capitalize } from 'lodash';
import {
  Enemy,
  Game,
  Item,
  Perk,
  TowerFloor,
  TowerRaider,
  TowerStatistics,
} from '../../../../models';
import { TOWER_ACTIONS_TYPE } from '../../../../models/TowerRoundAction';
import {
  APPROVE_SIGN,
  FULL_HEALTH_HEART_EMOJI,
  HEALTH_KIT_EMOJI,
  INFINITY_GIF_EMOJI,
  INITIATIVE_EMOJI,
  NO_ENTRY_SIGN,
  PLAYER_HIDE_EMOJI,
  PLAYER_VISIBLE_EMOJI,
} from '../../../consts/emojis';
import { SLACK_SPACE, TRAIT, ZERO } from '../../../consts/global';
import {
  basicHealthDisplay,
  basicHealthDisplayInParentheses,
  generateRarityColorEmoji,
  randomSkinColor,
} from '../../../helpers';
import { rateToPercentage } from '../../../utils';
import {
  MAX_AMOUNT_HEALTHKITS_ALLOWED,
  MAX_RAIDER_HEALTH,
  TOWER_ACTIONS,
  TOWER_HEALTHKITS,
} from '../../consts';
import { towerRoundActionMessageBuilder } from '../../utils';
import {
  raiderStatus,
  raiderBasicCharactersProgress,
  raiderFullProgress,
} from '../../utils/raiderStatus';

const FILL_WITH_EMOJIS_PARTY = 18;
const FILL_WITH_EMOJIS_TADA = 8;
const FILL_WITH_EMOJIS_RAIDER_RUNNING = 16;
const FREE_AGENT_EMOJI = ':dove_of_peace:';

function usefulCommands() {
  return (
    `*How to Play*\n` +
    `Defeat all floors of this Tower to shut down its network and join the leaderboard.\n` +
    '\n\t *`/tower-progress`* To check your *progress* (floor traits, health, inventory, enemies, etc)' +
    '\n\t *`/tower`* To display _Actions Menu_' +
    '\n\t *`/tower-exit`* and *`/tower-enter`* To *re-start* the game' +
    `\n\nMay the :x-gif: be with you.\n\n`
  );
}

function towerBasicScoreboard(towerStatistics: TowerStatistics[]) {
  return `${towerStatistics
    .map((raiderStats) => {
      return (
        `<@${raiderStats._user?.slackId}>\t*=>*\t` +
        `_${raiderStats.completed} *completed*_ ~ ` +
        `_${raiderStats.attempts} *attempts*_`
      );
    })
    .join('\n')}`;
}

function displayFloorNumberPosition(floorNumber: number): string {
  const TWO = 2;
  const THREE = 3;
  return `${floorNumber}${floorNumber === TWO ? 'nd' : floorNumber === THREE ? 'rd' : 'th'}`;
}

export const towerCommandReply = {
  // GENERIC //////////////////////////////////////////////////////////////////////////
  couldNotFindBySlackId: (slackId: string) => `User with slack ID: <@${slackId}> not found`,
  noActiveRound: () => 'There is no The Tower round in progress.',
  noActiveTower: () => `There's no Tower Game active at the moment`,
  noOpenedTower: () => `There's no Tower opened to enter or exit`,
  floorNumberNotValid: () => `The floor number provided is not valid`,
  enemyNotFound: () => `The enemy you provided doesn't exist`,
  perkNotFound: () => `The perk you provided doesn't exist`,
  itemNotFound: (type: string) => `The ${type} you provided doesn't exist`,
  enemyDeleted: () =>
    `Enemy deleted successfully` +
    '\nTo continue:' +
    '\n\t - Run `/tower-setfloors` if you are first time setting The Tower' +
    '\n\t - Run `/tower-info` if you are setting an already build up Tower Game',
  floorNotFound: () => `The floor you provided doesn't exist`,
  weaponNotFound: () => `The weapon chosen doesn't exist`,
  welcomeToTheTower: (weapon?: Item) =>
    `${usefulCommands()}` +
    `> You have arrived inside The Tower on the *1st floor* ${
      weapon ? `*with a ${weapon.name} ${weapon.emoji}*` : ''
    }. Prepare to fight:\n`,
  welcomeToNewFloor: (floorNumber: number) =>
    `${Array(FILL_WITH_EMOJIS_RAIDER_RUNNING)
      .fill(':arena-soldier-grenade:')
      .join(`${SLACK_SPACE}`)}\n` +
    `> You're heading to *${displayFloorNumberPosition(floorNumber)} floor*. Prepare to fight:\n`,
  raiderAlreadyInTheTower: (floor: TowerFloor) =>
    '> *You are already inside The Tower.*\n' +
    `${usefulCommands()}` +
    `You're currently in floor *${floor.number}*`,
  raiderWinsTower: (slackId: string) =>
    `${Array(FILL_WITH_EMOJIS_PARTY).fill(':parrot-arena:').join(`${SLACK_SPACE}`)}\n` +
    ':tada:\t\t\t\t\t\t\t\t\t*TOWER DEFEATED!*\t\t\t\t\t\t\t\t\t:tada:\n' +
    `:tada:\t   <@${slackId}> has claimed victory against the odds!  \t:tada:\n` +
    `${Array(FILL_WITH_EMOJIS_PARTY).fill(':parrot-arena:').join(`${SLACK_SPACE}`)}`,
  teamWinGame: (name: string) =>
    `\n:parrot-arena: We have a winner! :parrot-arena:\n` +
    `*${capitalize(name)}* has claimed victory against the odds!\n`,
  noCommandTextProvided: () =>
    "This command needs parameters, please read command's description to find out",
  noSlackIdProvided: () =>
    `:eager: Hurry! You need to provide a valid user for this command to work`,
  somethingWentWrong: (functionName: string) =>
    `:scream: Something went wrong in The Tower. ${functionName}`,
  commandFinished: (slackCommand: string) => `${slackCommand} command finished`,
  setTowerFloorEnemiesFinished: () =>
    'Thanks for setting this floor.' +
    '\nTo continue:' +
    '\n\t - Run `/tower-setfloors` if you are first time setting The Tower' +
    '\n\t - Run `/tower-info` if you are setting an already build up Tower Game',
  cannotUpdateTower: () => `You're trying to update a non-active Tower Game`,
  requiredTowerFormDataEmpy: () =>
    `Please remember a name (Unique), luna prize and coin prize must be provided`,

  // ADMIN //////////////////////////////////////////////////////////////////////////////
  adminsOnly: () => 'Only admins or community team can perform this action',
  adminEndedGame: (game: Game) => `The Tower game "${game.name}" ended.`,
  adminCreatedGame: (game: Game) => `*The Tower*\n Game "${game.name}" has been created.`,
  adminWeaponsForEveryone: () => 'Everyone gets a weapon',
  adminPlayersInfoPosted: () => 'Players Info Displayed',
  adminRevivedBoss: (bossSlackId: string) => `<@${bossSlackId}> will be revived now!`,
  teamNameNeeded: () => 'You must provide a Team Name for this command',
  adminSetFloor: (floorNumber: number) => `You're setting floor *#${floorNumber}*`,
  adminTowerSetCompleted: (name: string) => `The Tower _"${name}"_ is fully set and ready`,
  adminDisplayScoreboard: (game: Game, gameStatistics: TowerStatistics[]) =>
    `\n*The Tower: ${game.name} Stats*\n` +
    `\n${towerBasicScoreboard(gameStatistics)}\n` +
    `\n*Notation*\n` +
    `> _house_emoji_ *|* _@raider_ *=>* _# of towers completed_ ~ _# of attempts_\n` +
    `> ${FREE_AGENT_EMOJI} (Free Agent)`,
  cancelEndGame: () =>
    `Ok, the tower is still open and active, nothing happened here, you can keep walking :cop:${randomSkinColor()}`,
  towerGatesInfo: (isOpen: boolean) => `The Tower Gates are ${isOpen ? '*open*' : '*closed*'}`,

  // CHANNEL ////////////////////////////////////////////////////////////////////////////
  channelEndGame: (game: Game) => `The Tower game "${game.name}" ended. Thanks for playing!`,

  channelEndingTheFloor: (floorNumber: number) =>
    `${Array(FILL_WITH_EMOJIS_TADA).fill(':tada: :confetti_ball:').join(`${SLACK_SPACE}`)}\n` +
    `\nYou defeated everyone on this floor, *Congrats!*\n` +
    `Next up, floor ${floorNumber}. *Good Luck. You'll need it!*\n\n` +
    `${Array(FILL_WITH_EMOJIS_TADA).fill(':tada: :confetti_ball:').join(`${SLACK_SPACE}`)}\n`,

  channelLootPrizeEarned: (lootPrize: Item[], healthKitsAutoApplied: number) =>
    `\n*HERE'S YOUR LOOT, RAIDER*\n` +
    `${lootPrize
      .map(
        (prize) =>
          `\t${generateRarityColorEmoji(prize._itemRarityId)} ${prize.emoji} ` +
          `${
            prize.name === TOWER_HEALTHKITS.COMMON && Math.max(healthKitsAutoApplied--, ZERO)
              ? `${prize.name} (Auto-applied)`
              : `${prize.name}`
          }`
      )
      .join('\n')}` +
    `\n*Remember:* If you win _health kits_, they will be automatically applied if needed.\n\n`,

  channelRaiderWonTheTower: (slackId: string) =>
    `:tada: <@${slackId}> just defeated all floors of The Tower. One Tower down, many more to go. Great work!`,

  channelRaiderEntersTheTower: (slackId: string) =>
    `:eager: So it begins... <@${slackId}> is entering The Tower. May the :x-gif: be with you.`,

  // ENEMY ///////////////////////////////////////////////////////////////////////////
  enemyNotInTheGame: () => `:warning: The Enemy you're looking for is not in the game or dead`,
  enemyHiding: () => `:warning: The Enemy you're looking for is hiding.`,
  enemiesGifs: (enemies: Enemy[]) =>
    enemies
      .map(
        (enemy) =>
          `*${enemy.emoji}${enemy.name} ${basicHealthDisplayInParentheses(enemy.health)}*\n\n${
            enemy.gifUrl
          }\n`
      )
      .join('\n'),

  // RAIDER ///////////////////////////////////////////////////////////////////////////
  raiderBasicCharactersProgress,
  raiderFullProgress,
  raiderStatus,

  raiderHUD: (raider: TowerRaider) => {
    const weapons = raider._weapons?.length ? raider._weapons : undefined;
    const armor = raider._armors?.length ? raider._armors[ZERO] : undefined;
    const healthkit = raider._healthkits?.length
      ? raider._healthkits.find((healthkit) => healthkit.name === TOWER_HEALTHKITS.COMMON)
      : undefined;
    return (
      `${basicHealthDisplay(raider.health, MAX_RAIDER_HEALTH)}` +
      `${
        weapons
          ? `*|*${weapons
              .map(
                (w) =>
                  `${generateRarityColorEmoji(w._itemRarityId)}${w.emoji}x${
                    w.TowerItemInventory.remainingUses ?? ` ${INFINITY_GIF_EMOJI}`
                  }`
              )
              .join('')} `
          : ''
      }` +
      `${armor ? `*|* ${armor.emoji} ` : ''}` +
      `*|* ${HEALTH_KIT_EMOJI}x${healthkit?.TowerItemInventory.remainingUses ?? ZERO} ` +
      `*|* ${raider.isVisible ? PLAYER_VISIBLE_EMOJI : PLAYER_HIDE_EMOJI}` +
      `*|* ${INITIATIVE_EMOJI} ${rateToPercentage(raider.abilitiesJSON.initiative)}`
    );
  },
  finalStats: (raider: TowerRaider) => `*FINAL STATS*\n\n${raiderStatus(raider)}`,

  raiderDoesntHaveAction: () => ":eager: Hurry! You haven't provided a valid action",

  raiderNotInTheGame: () => `${NO_ENTRY_SIGN}  You need to be inside The Tower, to send actions`,

  raiderHealsSomebodyMaxed: (targetSlackId: string) =>
    `${NO_ENTRY_SIGN} <@${targetSlackId}> is at full health.\n:eager: Hurry! Take another action!`,

  raiderHealsSelfMaxed: () =>
    `${NO_ENTRY_SIGN} Your health is alright.\n:eager: Hurry! Take another action!`,

  raiderNeedsHealthKit: () =>
    `${NO_ENTRY_SIGN} You need to find a health kit to heal yourself or another watchman.\n` +
    'Use `Search for a healthkit` first.',

  raiderHealsSelf: (isVisible: boolean, healthkitHealingPower: number) =>
    towerRoundActionMessageBuilder({
      actionText: `*heal* +${healthkitHealingPower} HP`,
      emoji: FULL_HEALTH_HEART_EMOJI,
      isVisible,
    }),

  raiderHealsSomebody: (targetSlackId: string, isVisible: boolean, healthkitHealingPower: number) =>
    towerRoundActionMessageBuilder({
      actionText: `*heal* <@${targetSlackId}> for +${healthkitHealingPower} HP`,
      emoji: FULL_HEALTH_HEART_EMOJI,
      isVisible,
    }),

  raiderSearchesForItem: (action: TOWER_ACTIONS_TYPE) => {
    let mutableActionText = 'something';
    let mutableEmoji = ':mag:';
    let mutableComplementaryMessage = 'will help you';
    switch (action) {
      case TOWER_ACTIONS.SEARCH_HEALTH:
        mutableActionText = 'health kits';
        mutableEmoji = ':medkit:';
        mutableComplementaryMessage = 'can help revive your (or others) health';
        break;
      case TOWER_ACTIONS.SEARCH_WEAPONS:
        mutableActionText = 'weapons';
        mutableComplementaryMessage = 'will allow you to hunt enemies.';
        break;
      case TOWER_ACTIONS.SEARCH_ARMOR:
        mutableActionText = 'armors';
        mutableComplementaryMessage = 'will allow you to reduce damage from enemies.';
        break;
    }
    return towerRoundActionMessageBuilder({
      actionText: `start *looking for ${mutableActionText}*`,
      emoji: mutableEmoji,
      isVisible: true,
      secondaryMessage: `If you find one, it ${mutableComplementaryMessage}`,
    });
  },

  raiderHides: () =>
    towerRoundActionMessageBuilder({
      actionText: `*find somewhere to hide*`,
      emoji: PLAYER_HIDE_EMOJI,
      isVisible: false,
      secondaryMessage:
        'You will then be safe from being hunted by enemies (unless they have the _Detect_ trait)',
    }),

  raiderCannotHide: () =>
    `${NO_ENTRY_SIGN} This floor has nowhere to hide\n:eager: Hurry! Take another action!`,

  raiderHasNoPreviousAction: () =>
    `${NO_ENTRY_SIGN} You *don't have* a previous action. Probably because you just get to a new floor.\n` +
    `:eager: Hurry! Choose an action!`,

  raiderHuntsEnemies: (weapon: Item, isVisible: boolean) => {
    let mutableSecondaryMessage = 'If you hit, you will deal damage to *1 enemy*';
    const additionalMessages = [];
    if (weapon.hasTrait(TRAIT.BLAST_2)) {
      mutableSecondaryMessage = 'If you hit, you will deal damage to *2 enemies* (Area Damage)';
    } else if (weapon.hasTrait(TRAIT.BLAST_3)) {
      mutableSecondaryMessage = 'If you hit, you will deal damage to *3 enemies* (Area Damage)';
    } else if (weapon.hasTrait(TRAIT.BLAST_ALL)) {
      mutableSecondaryMessage = 'If you hit, you will deal damage to *ALL enemies* (Area Damage)';
    }

    if (weapon.hasTrait(TRAIT.DUALSTRIKE)) {
      additionalMessages.push(`You will hit *twice* (_${weapon.emoji}'s Dualstrike trait_)`);
    }
    if (weapon.hasTrait(TRAIT.PIERCING)) {
      additionalMessages.push(
        `Your attack will *ignore the enemy's armor* (_${weapon.emoji}'s Piercing trait_)`
      );
    }
    if (weapon.hasTrait(TRAIT.ARMORBREAK)) {
      additionalMessages.push(
        `Your attack will *break the enemy's armor* (_${weapon.emoji}'s Armorbreak trait_)`
      );
    }

    return towerRoundActionMessageBuilder({
      actionText: `start *hunting enemies* with`,
      emoji: weapon.emoji,
      isVisible,
      secondaryMessage: mutableSecondaryMessage,
      additionalMessages,
    });
  },

  raiderNeedsWeapon: () =>
    `${NO_ENTRY_SIGN} You need to find a weapon before you can hunt!\n` +
    `:point_right:${randomSkinColor()} Try *searching for weapons* first, but remember that *you’ll be visible* to enemies`,

  raiderHasNoPreviousActionWeapon: () =>
    `${NO_ENTRY_SIGN} You have *no more ammo* with the weapon _you used_ in the previous round!\n` +
    `${NO_ENTRY_SIGN} You need to find or select an available weapon before you can hunt!\n` +
    `:point_right:${randomSkinColor()} Try *searching for weapons* first, or select a new weapon if you have one.`,

  raiderChooseWeapon: () => 'Which of your weapons would you like to hunt with?',

  raiderChooseTarget: () => ':dart: Pick your target wisely',

  raiderCannotCarryMoreHealthkits: () =>
    `You can't carry more healthkits in your bag. (max. ${MAX_AMOUNT_HEALTHKITS_ALLOWED})\n` +
    `:eager: Hurry! choose another action`,

  raiderMustRestart: () =>
    'It seems you *finished* The Tower or there is a bug with your progress.\nPlease send `/tower-exit` and then `/tower-enter` to re-start The Tower for you.',

  raiderMustEnter: () =>
    'You were kicked out.\nPlease send `/tower-enter` to re-start The Tower for you (or click *YES* in the next question).',

  raiderLoseTower: (slackId: string, floorNumber: number) =>
    `<@${slackId}> was kicked out from The Tower. *(floor ${floorNumber})*`,

  raiderExitTower: () => `You exit the tower successfully`,

  perkImplemented: (perk: Perk) =>
    `${perk.emoji} *${perk.name}* perk was implemented successfully ${APPROVE_SIGN}`,

  itemAddedOrApplied: (item: Item | Item | Item, type: string) => {
    let mutableMessage = `${item.emoji} *${item.name}*`;
    switch (type) {
      case 'item':
        mutableMessage = `${mutableMessage} was added or applied`;
        break;
      case 'armor':
        mutableMessage = `${mutableMessage} was renewed or added`;
        break;
      case 'weapon':
        mutableMessage = `${mutableMessage} was renewed or added`;
        break;
    }
    return `${mutableMessage} successfully ${APPROVE_SIGN}`;
  },
};
