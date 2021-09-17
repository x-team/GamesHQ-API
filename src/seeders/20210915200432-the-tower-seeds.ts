import { QueryInterface, QueryTypes, Sequelize, Transaction } from 'sequelize';

enum GAME_TYPE {
  TOWER = 'The Tower',
  ARENA = 'The Arena',
}

enum SHARED_ACTIONS {
  HIDE = 'hide',
  HUNT = 'hunt',
}

enum TOWER_ACTIONS {
  CHARGE = 'charge',
}

enum ARENA_ACTIONS {
  STAY_ON_LOCATION = 'idleStayOnLocation',
}

enum ALL_GAME_ACTION_MAPPING {
  HIDE = 'H', // Hide
  HUNT = 'A', // Hunt
  CHARGE = 'C', // Charge
  STAY_ON_LOCATION = 'L', // Stay on location
}

enum TRAIT {
  ARMORBREAK = 'armorbreak',
  BLAST_2 = 'blast_2',
  BLAST_3 = 'blast_3',
  BLAST_ALL = 'blast_all',
  DETECT = 'detect',
  DUALSTRIKE = 'dualstrike',
  INITIAL = 'initial',
  PIERCING = 'piercing',
  PRECISION = 'precision',
  STEALTH = 'stealth',
  UNSEARCHABLE = 'unsearchable',
}

enum ENEMY_NAME_TO_ADD {
  HUNTRESS = 'Huntress',
  KAGE = 'Kage',
  SPYDERBOT = 'Spyderbot',
  HIKARI = 'Hikari',
  HUNTSMAN = 'Huntsman',
  CYTTHRAX = 'Cythrax',
  INQUISITOR = 'Inquisitor',
  PYRO = 'Pyro',
  FLAMER = 'Flamer',
  // END OF THE ENEMIES WITH TRAITS
  KNIGHT = 'Knight',
  CAPITAIN = 'Capitain',
  PALADIN = 'Paladin',
  SOLDIER = 'Soldier',
  GENERAL = 'General',
  RAITO = 'Raito',
  DROGO = 'Drogo',
}

function generateEnemyPatterns(patternLength: number, gameFor: GAME_TYPE) {
  let mutableActionString = '';
  let MUTABLE_ACTIONS_TO_PARSE = SHARED_ACTIONS;

  switch (gameFor) {
    case GAME_TYPE.ARENA:
      MUTABLE_ACTIONS_TO_PARSE = {
        ...MUTABLE_ACTIONS_TO_PARSE,
        ...ARENA_ACTIONS,
      };
      break;
    case GAME_TYPE.TOWER:
      MUTABLE_ACTIONS_TO_PARSE = {
        ...MUTABLE_ACTIONS_TO_PARSE,
        ...TOWER_ACTIONS,
      };
      break;
  }

  Object.values(MUTABLE_ACTIONS_TO_PARSE).forEach((action) => {
    const actionSymbol = parseEnemyActionToSymbol(action);
    if (actionSymbol) {
      mutableActionString += actionSymbol;
    }
  });
  return tree(mutableActionString, patternLength);
}

function parseEnemyActionToSymbol(action: SHARED_ACTIONS | TOWER_ACTIONS | ARENA_ACTIONS) {
  switch (action) {
    case SHARED_ACTIONS.HUNT:
      return ALL_GAME_ACTION_MAPPING.HUNT;
    case SHARED_ACTIONS.HIDE:
      return ALL_GAME_ACTION_MAPPING.HIDE;
    case ARENA_ACTIONS.STAY_ON_LOCATION:
      return ALL_GAME_ACTION_MAPPING.STAY_ON_LOCATION;
    case TOWER_ACTIONS.CHARGE:
      return ALL_GAME_ACTION_MAPPING.CHARGE;
    default:
      return undefined;
  }
}

function tree(base: string, depth: number) {
  const branches = base.length;
  const tree: Array<string[]> = [];
  for (let mutableBranch = 0; mutableBranch < branches; mutableBranch++) {
    tree.push(generateBranch(base, base[mutableBranch], mutableBranch, 1, depth));
  }
  const regexp = new RegExp(`.{1,${depth}}`, 'g');
  return tree.join('').match(regexp) as Array<string>;
}

function generateBranch(
  base: string,
  origin: string,
  baseIndex: number,
  currentDepth: number,
  maxDepth: number
): any {
  if (currentDepth === maxDepth) {
    return origin;
  }
  const branches = base.length;
  let mutablePattern = '';
  for (let mutableBranch = 0; mutableBranch < branches; mutableBranch++) {
    mutablePattern += generateBranch(
      base,
      origin + base[mutableBranch],
      baseIndex,
      currentDepth + 1,
      maxDepth
    );
  }
  return mutablePattern;
}

interface SequelizeContext {
  context: {
    queryInterface: QueryInterface;
    Sequelize: Sequelize;
  };
}

interface Enemy {
  id: number;
  name: string;
}

function queryEnemyByName(
  name: string,
  queryInterface: QueryInterface,
  transaction: Transaction
): Promise<Enemy[]> {
  const queryString = `SELECT id, "name" FROM "Enemy" WHERE "name" = '${name}';`;
  return queryInterface.sequelize.query(queryString, {
    transaction,
    type: QueryTypes.SELECT,
  });
}

module.exports = {
  async up({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      //////////////////////////////////////////////////
      // Create All Patterns
      const patternLength = 4;
      const allPatterns = generateEnemyPatterns(patternLength, GAME_TYPE.TOWER);
      await queryInterface.bulkInsert(
        'EnemyPattern',
        allPatterns.map((pattern) => ({ id: pattern })),
        { transaction }
      );

      //////////////////////////////////////////////////
      // Create All ENEMIES with their PATTERNS and TRAITS

      await queryInterface.bulkInsert(
        'Enemy',
        [
          {
            name: ENEMY_NAME_TO_ADD.HUNTRESS,
            emoji: ':huntress:',
            minorDamageRate: 10,
            majorDamageRate: 12,
            health: 15,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/UulBEnT.gif',
            _enemyPatternId: 'HAAH',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 0.96,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.KAGE,
            emoji: ':kage:',
            minorDamageRate: 20,
            majorDamageRate: 25,
            health: 45,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/oGcc7kX.gif',
            _enemyPatternId: 'CHAA',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 2.5,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.SPYDERBOT,
            emoji: ':spyderbot:',
            minorDamageRate: 20,
            majorDamageRate: 25,
            health: 100,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/Ag6qQab.gif',
            _enemyPatternId: 'HAAC',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 0.8,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 1,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.HIKARI,
            emoji: ':hikari:',
            minorDamageRate: 20,
            majorDamageRate: 25,
            health: 45,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/ZowZ5Tg.gif',
            _enemyPatternId: 'HAHA',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 2.5,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.HUNTSMAN,
            emoji: ':huntsman:',
            minorDamageRate: 16,
            majorDamageRate: 20,
            health: 200,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/sWK5F55.gif',
            _enemyPatternId: 'AHAC',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 1.8,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.CYTTHRAX,
            emoji: 'cythrax',
            minorDamageRate: 40,
            majorDamageRate: 120,
            health: 500,
            isBoss: true,
            gifUrl: 'https://i.imgur.com/YE1dktx.gif',
            _enemyPatternId: 'CCCC',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 3,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.INQUISITOR,
            emoji: ':inquisitor:',
            minorDamageRate: 25,
            majorDamageRate: 30,
            health: 100,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/CIDEA4q.gif',
            _enemyPatternId: 'ACCH',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 1.5,
              searchRate: 0,
              defenseRate: 0.75,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.PYRO,
            emoji: ':pyro:',
            minorDamageRate: 30,
            majorDamageRate: 50,
            health: 80,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/PBMYuBO.gif',
            _enemyPatternId: 'CCCA',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 0.9,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.FLAMER,
            emoji: ':flamer:',
            minorDamageRate: 20,
            majorDamageRate: 40,
            health: 40,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/7ZjB7wq.gif',
            _enemyPatternId: 'CACA',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 0.9,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.KNIGHT,
            emoji: ':cyberknight:',
            minorDamageRate: 20,
            majorDamageRate: 25,
            health: 40,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/gATFLhB.gif',
            _enemyPatternId: 'ACAC',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 0.85,
              searchRate: 0,
              defenseRate: 0.25,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.CAPITAIN,
            emoji: ':capitain:',
            minorDamageRate: 18,
            majorDamageRate: 20,
            health: 30,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/vqbvC1M.gif',
            _enemyPatternId: 'AACA',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 1.1,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.PALADIN,
            emoji: ':paladin:',
            minorDamageRate: 30,
            majorDamageRate: 35,
            health: 60,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/j0K8YmE.gif',
            _enemyPatternId: 'ACCC',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 0.85,
              searchRate: 0,
              defenseRate: 0.5,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.SOLDIER,
            emoji: ':soldier:',
            minorDamageRate: 16,
            majorDamageRate: 20,
            health: 20,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/x0fhb42.gif',
            _enemyPatternId: 'AAAC',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 1.05,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.GENERAL,
            emoji: ':general:',
            minorDamageRate: 20,
            majorDamageRate: 20,
            health: 40,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/NptrgQO.gif',
            _enemyPatternId: 'ACAA',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 1.13,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.RAITO,
            emoji: ':raito:',
            minorDamageRate: 20,
            majorDamageRate: 25,
            health: 30,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/kZ2eD38.gif',
            _enemyPatternId: 'HHAA',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 1.1,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 0,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
          {
            name: ENEMY_NAME_TO_ADD.DROGO,
            emoji: ':drogo:',
            minorDamageRate: 16,
            majorDamageRate: 24,
            health: 30,
            isBoss: false,
            gifUrl: 'https://i.imgur.com/9fRNl0t.gif',
            _enemyPatternId: 'CCAA',
            abilitiesJSON: JSON.stringify({
              accuracy: 0,
              evadeRate: 0,
              attackRate: 0,
              initiative: 0.96,
              searchRate: 0,
              defenseRate: 0,
              stunBlockRate: 1,
              stunOthersRate: 0,
              armorSearchRate: 0,
              flatAttackBonus: 0,
              initiativeBonus: 0,
              rarityRateBonus: 0,
              flatDefenseBonus: 0,
              flatHealingBoost: 0,
              weaponSearchRate: 0,
              healthkitSearchRate: 0,
            }),
          },
        ],
        { transaction }
      );

      const [huntress] = await queryEnemyByName(
        ENEMY_NAME_TO_ADD.HUNTRESS,
        queryInterface,
        transaction
      );

      const [kage] = await queryEnemyByName(ENEMY_NAME_TO_ADD.KAGE, queryInterface, transaction);

      const [spyderbot] = await queryEnemyByName(
        ENEMY_NAME_TO_ADD.SPYDERBOT,
        queryInterface,
        transaction
      );

      const [hikari] = await queryEnemyByName(
        ENEMY_NAME_TO_ADD.HIKARI,
        queryInterface,
        transaction
      );

      const [huntsman] = await queryEnemyByName(
        ENEMY_NAME_TO_ADD.HUNTSMAN,
        queryInterface,
        transaction
      );

      const [cythrax] = await queryEnemyByName(
        ENEMY_NAME_TO_ADD.CYTTHRAX,
        queryInterface,
        transaction
      );

      const [inquisitor] = await queryEnemyByName(
        ENEMY_NAME_TO_ADD.INQUISITOR,
        queryInterface,
        transaction
      );

      const [pyro] = await queryEnemyByName(ENEMY_NAME_TO_ADD.PYRO, queryInterface, transaction);

      const [flamer] = await queryEnemyByName(
        ENEMY_NAME_TO_ADD.FLAMER,
        queryInterface,
        transaction
      );

      await queryInterface.bulkInsert(
        'EnemyTrait',
        [
          {
            _enemyId: huntress!.id,
            _traitId: TRAIT.DUALSTRIKE,
          },
          {
            _enemyId: kage!.id,
            _traitId: TRAIT.STEALTH,
          },
          {
            _enemyId: spyderbot!.id,
            _traitId: TRAIT.DETECT,
          },
          {
            _enemyId: hikari!.id,
            _traitId: TRAIT.DETECT,
          },
          {
            _enemyId: huntsman!.id,
            _traitId: TRAIT.DETECT,
          },
          {
            _enemyId: huntsman!.id,
            _traitId: TRAIT.PIERCING,
          },
          {
            _enemyId: cythrax!.id,
            _traitId: TRAIT.ARMORBREAK,
          },
          {
            _enemyId: inquisitor!.id,
            _traitId: TRAIT.ARMORBREAK,
          },
          {
            _enemyId: pyro!.id,
            _traitId: TRAIT.PIERCING,
          },
          {
            _enemyId: flamer!.id,
            _traitId: TRAIT.PIERCING,
          },
        ],
        { transaction }
      );
    });
  },

  async down({ context: { queryInterface } }: SequelizeContext) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete('EnemyTrait', {}, { transaction });
      await queryInterface.bulkDelete('Enemy', {}, { transaction });
      await queryInterface.bulkDelete('EnemyPattern', {}, { transaction });
    });
  },
};
