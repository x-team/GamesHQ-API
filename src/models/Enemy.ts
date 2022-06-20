import { random } from 'lodash';
import type { Association, Transaction, WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  Unique,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
} from 'sequelize-typescript';

import { logger } from '../config';
import { Ability, AbilityProperty } from '../games/classes/GameAbilities';
import type { TRAIT } from '../games/consts/global';
import {
  BOSS_MAX_DAMAGE_RATE,
  BOSS_MIN_DAMAGE_RATE,
  ENEMY_MAX_DAMAGE_RATE,
  ENEMY_MIN_DAMAGE_RATE,
  MAX_BOSS_HEALTH,
  MAX_ENEMY_HEALTH,
  MIN_BOSS_HEALTH,
  MIN_ENEMY_HEALTH,
} from '../games/tower/consts';

import { EnemyPattern, EnemyTrait, Organization, Trait } from '.';

export interface EnemyCreationAttributes {
  id?: number;
  name: string;
  emoji: string;
  gifUrl: string;
  minorDamageRate?: number;
  majorDamageRate?: number;
  health?: number;
  isBoss?: boolean;
  _enemyPatternId: string;
  abilitiesJSON: AbilityProperty;
}

export interface EnemyAttributes {
  id: number;
  name: string;
  emoji: string;
  gifUrl?: string;
  minorDamageRate: number;
  majorDamageRate: number;
  health: number;
  isBoss: boolean;
  abilitiesJSON: AbilityProperty;
  _enemyPatternId: string;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['name'],
    },
  ],
})
export class Enemy
  extends Model<EnemyAttributes, EnemyCreationAttributes>
  implements EnemyAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column(DataType.TEXT)
  declare name: string;

  @Column(DataType.TEXT)
  declare emoji: string;

  @Column(DataType.DOUBLE)
  declare minorDamageRate: number;

  @Column(DataType.DOUBLE)
  declare majorDamageRate: number;

  @Column(DataType.INTEGER)
  declare health: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isBoss: boolean;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare gifUrl?: string;

  @Default(Ability.defaultProps())
  @Column(DataType.JSONB)
  declare abilitiesJSON: AbilityProperty;

  @ForeignKey(() => EnemyPattern)
  @Column(DataType.TEXT)
  declare _enemyPatternId: string;

  @BelongsTo(() => EnemyPattern, {
    foreignKey: '_enemyPatternId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  declare _enemyPattern?: EnemyPattern;

  @ForeignKey(() => Organization)
  @Column(DataType.INTEGER)
  declare _organizationId: string;

  @BelongsTo(() => Organization, {
    foreignKey: '_organizationId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: '_organization',
  })
  declare _organization?: Organization;

  @BelongsToMany(() => Trait, {
    through: () => EnemyTrait,
    foreignKey: '_enemyId',
    otherKey: '_traitId',
    as: '_traits',
  })
  declare _traits?: Array<Trait & { EnemyTrait: EnemyTrait }>;

  static associations: {
    _enemyPattern: Association<Enemy, EnemyPattern>;
    _traits: Association<Enemy, EnemyTrait>;
    _organization: Association<Enemy, Organization>;
  };

  hasTrait(trait: TRAIT) {
    if (!this._traits) {
      logger.error("An enemy without the Traits relationship called 'hasTrait()'.");
      return false;
    }

    return this._traits.filter((traitObject) => traitObject.id === trait).length > 0;
  }

  async refreshTraits(traits: string[], transaction?: Transaction) {
    if (traits.length == 0) {
      return;
    }
    await EnemyTrait.destroy({
      where: {
        _enemyId: this.id,
      },
      transaction,
    });

    const traitRefs = await Trait.findAll({
      where: {
        id: {
          [Op.in]: traits,
        },
      },
      transaction,
    });

    traitRefs.forEach(async (traitRef) => {
      await EnemyTrait.create(
        {
          _enemyId: this.id,
          _traitId: traitRef.id,
        },
        {
          transaction,
        }
      );
    });
  }
}

export function findAllEnemies(transaction?: Transaction) {
  return Enemy.findAll({ include: [{ association: Enemy.associations._traits }], transaction });
}

export function findEnemyById(id: number, transaction?: Transaction) {
  return Enemy.findByPk(id, {
    include: [{ association: Enemy.associations._traits }],
    transaction,
  });
}

export function findEnemyByName(name: string, transaction?: Transaction) {
  return Enemy.findOne({
    where: { name },
    include: [{ association: Enemy.associations._traits }],
    transaction,
  });
}

export async function deleteEnemyById(id: number, transaction: Transaction) {
  // await EnemyTrait.destroy({
  //   where: {
  //     _enemyId: id,
  //   },
  //   transaction,
  // });
  // const towerFloorEnemies = await TowerFloorEnemy.findAll({
  //   where: {
  //     _enemyId: id,
  //   },
  //   transaction,
  // });
  // const towerFloorBattlefieldEnemies = await TowerFloorBattlefieldEnemy.findAll({
  //   where: {
  //     _towerFloorEnemyId: {
  //       [Op.in]: towerFloorEnemies.map((towerFloorEnemy) => towerFloorEnemy.id),
  //     },
  //   },
  //   transaction,
  // });
  // await TowerRoundAction.destroy({
  //   where: {
  //     _towerFloorBattlefieldEnemyId: {
  //       [Op.in]: towerFloorBattlefieldEnemies.map(
  //         (towerFloorBattlefieldEnemy) => towerFloorBattlefieldEnemy.id
  //       ),
  //     },
  //   },
  //   transaction,
  // });
  // await Promise.all(
  //   towerFloorBattlefieldEnemies.map(async (towerFloorBattlefieldEnemy) => {
  //     await towerFloorBattlefieldEnemy.destroy({ transaction });
  //   })
  // );
  // await Promise.all(
  //   towerFloorEnemies.map(async (towerFloorEnemy) => {
  //     await towerFloorEnemy.destroy({ transaction });
  //   })
  // );
  return Enemy.destroy({
    where: {
      id,
    },
    transaction,
  });
}

export async function createOrUpdateEnemy(
  {
    id,
    name,
    emoji,
    gifUrl,
    minorDamageRate,
    majorDamageRate,
    health,
    isBoss,
    _enemyPatternId: pattern,
    abilitiesJSON,
  }: EnemyCreationAttributes,
  transaction: Transaction
) {
  if (isBoss) {
    minorDamageRate =
      minorDamageRate ?? random(BOSS_MIN_DAMAGE_RATE, majorDamageRate || BOSS_MAX_DAMAGE_RATE);
    majorDamageRate =
      majorDamageRate ?? random(minorDamageRate || BOSS_MIN_DAMAGE_RATE, BOSS_MAX_DAMAGE_RATE);
    health = health ?? random(MIN_BOSS_HEALTH, MAX_BOSS_HEALTH);
  } else {
    minorDamageRate =
      minorDamageRate ?? random(ENEMY_MIN_DAMAGE_RATE, majorDamageRate || ENEMY_MAX_DAMAGE_RATE);
    majorDamageRate =
      majorDamageRate ?? random(minorDamageRate || ENEMY_MIN_DAMAGE_RATE, ENEMY_MAX_DAMAGE_RATE);
    health = health ?? random(MIN_ENEMY_HEALTH, MAX_ENEMY_HEALTH);
  }
  return Enemy.upsert(
    {
      ...(id && { id }),
      name,
      emoji,
      gifUrl,
      minorDamageRate,
      majorDamageRate,
      health,
      isBoss,
      _enemyPatternId: pattern,
      abilitiesJSON,
    },
    { transaction }
  );
}

interface DeleteEnemySpecs {
  id?: number;
  name?: string;
}

export async function deleteEnemy({ id, name }: DeleteEnemySpecs, transaction: Transaction) {
  const where: WhereOptions = {};
  if (!id && !name) {
    return 0;
  }
  if (id) {
    where.id = id;
  } else {
    where.name = name!;
  }
  return Enemy.destroy({
    where,
    transaction,
  });
}
