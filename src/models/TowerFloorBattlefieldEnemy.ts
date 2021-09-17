import type { Association, Transaction } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  BelongsToMany,
  Default,
  ForeignKey,
  AllowNull,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';

import { TowerFloorEnemy, TowerFloorBattlefield, Perk, PerkInventory } from '.';
import { Ability, AbilityProperty, AbilityPropertyKeys } from '../games/classes/GameAbilities';
import { ONE, TRAIT, ZERO } from '../games/consts/global';
import { INITIATIVE_DECREASE, INITIATIVE_INCREASE } from '../games/tower/consts';
import { Enemy } from './Enemy';

interface TowerFloorBattlefieldEnemyAttributes {
  id: number;
  health: number;
  isVisible: boolean;
  patternCursor: number;
  patternCounter: number;
  abilitiesJSON: AbilityProperty;
  _towerFloorEnemyId: number;
  _towerFloorBattlefieldId: number;
}

interface TowerFloorBattlefieldEnemyCreationAttributes {
  health: number;
  isVisible?: boolean;
  patternCursor?: number;
  patternCounter?: number;
  abilitiesJSON?: AbilityProperty;
  _towerFloorEnemyId: number;
  _towerFloorBattlefieldId: number;
}

@Table({
  indexes: [
    {
      unique: true,
      fields: ['_towerFloorBattlefieldId', '_towerFloorEnemyId'],
    },
    {
      fields: ['isVisible'],
    },
    {
      fields: ['_towerFloorBattlefieldId'],
    },
  ],
})
export class TowerFloorBattlefieldEnemy
  extends Model<TowerFloorBattlefieldEnemyAttributes, TowerFloorBattlefieldEnemyCreationAttributes>
  implements TowerFloorBattlefieldEnemyAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.INTEGER)
  health!: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isVisible!: boolean;

  @Default(ZERO)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  patternCursor!: number;

  @Default(ZERO)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  patternCounter!: number;

  @Default(Ability.defaultProps())
  @Column(DataType.JSONB)
  abilitiesJSON!: AbilityProperty;

  @ForeignKey(() => TowerFloorEnemy)
  @Column(DataType.INTEGER)
  _towerFloorEnemyId!: number;

  @BelongsTo(() => TowerFloorEnemy, {
    foreignKey: '_towerFloorEnemyId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _towerFloorEnemy?: TowerFloorEnemy;

  @ForeignKey(() => TowerFloorBattlefield)
  @Column(DataType.INTEGER)
  _towerFloorBattlefieldId!: number;

  @BelongsTo(() => TowerFloorBattlefield, {
    foreignKey: '_towerFloorBattlefieldId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _currentTowerFloorBattlefield?: TowerFloorBattlefield;

  @BelongsToMany(() => Perk, {
    through: () => PerkInventory,
    foreignKey: '_towerFloorBattlefieldEnemyId',
    otherKey: '_perkId',
    as: '_perks',
  })
  _perks?: Array<Perk & { PerkInventory: PerkInventory }>;

  static associations: {
    _towerFloorEnemy: Association<TowerFloorBattlefieldEnemy, TowerFloorEnemy>;
    _currentTowerFloorBattlefield: Association<TowerFloorBattlefieldEnemy, TowerFloorBattlefield>;
    _perks: Association<TowerFloorBattlefieldEnemy, Perk>;
  };

  async incrementCursor(patternLength: number, transaction: Transaction) {
    const RESTART_VALUE = 0;
    const INCREMENT_VALUE = 1;
    if (this.patternCursor === patternLength - ONE) {
      await this.increment('patternCounter', { by: INCREMENT_VALUE, transaction });
      this.patternCursor = RESTART_VALUE;
      await this.save({ transaction });
    } else {
      await this.increment('patternCursor', { by: INCREMENT_VALUE, transaction });
    }
    await this.reload({ transaction });
  }

  hasTrait(trait: TRAIT) {
    return this._towerFloorEnemy?._enemy?.hasTrait(trait);
  }

  isDead() {
    return this.health <= 0;
  }

  breakArmor(transaction?: Transaction) {
    return breakEnemyArmor(this, transaction);
  }

  isAlive() {
    return this.health > 0;
  }

  isCurrentlyVisible() {
    return this.isVisible;
  }

  async setVisibility(isVisible: boolean, transaction: Transaction) {
    return this.isVisible !== isVisible ? this.update({ isVisible }, { transaction }) : this;
  }

  async damageAndHide(damage: number, isVisible: boolean, transaction: Transaction) {
    await this.update(
      {
        health: Math.max(this.health - damage, 0),
        isVisible,
      },
      { transaction }
    );
  }

  async addOrSubtractInitiative(operation: string = 'add' || 'sub', transaction: Transaction) {
    const DECIMAL_PLACES = 2;
    const newAbility = new Ability({
      initiative: operation === 'add' ? INITIATIVE_INCREASE : INITIATIVE_DECREASE,
    });
    const newAbilitiesJSON: AbilityProperty = newAbility.toJSON();
    (Object.keys(this.abilitiesJSON) as AbilityPropertyKeys[]).forEach(
      (key: AbilityPropertyKeys) => {
        newAbilitiesJSON[key] = parseFloat(
          (newAbilitiesJSON[key] + this.abilitiesJSON[key]).toFixed(DECIMAL_PLACES)
        );
      }
    );
    this.abilitiesJSON = newAbilitiesJSON;
    await this.save({ transaction });
  }

  reloadFullEnemy(transaction: Transaction) {
    return this.reload({
      include: [
        {
          association: TowerFloorBattlefieldEnemy.associations._towerFloorEnemy,
          include: [
            {
              association: TowerFloorEnemy.associations._enemy,
              include: [Enemy.associations._traits],
            },
          ],
        },
      ],
      transaction,
    });
  }
}

export function breakEnemyArmor(enemy: TowerFloorBattlefieldEnemy, transaction?: Transaction) {
  const newAbility = new Ability({
    ...enemy.abilitiesJSON,
  });

  newAbility.set('defenseRate', ZERO);
  enemy.abilitiesJSON = newAbility.toJSON();
  return enemy.save({ transaction });
}

export function findBattlefieldEnemyById(id: number, transaction: Transaction) {
  return TowerFloorBattlefieldEnemy.findByPk(id, { transaction });
}

export function findEnemiesByFloorBattlefield(battlefieldId: number, transaction: Transaction) {
  return TowerFloorBattlefieldEnemy.findAll({
    where: { _towerFloorBattlefieldId: battlefieldId },
    include: [
      {
        association: TowerFloorBattlefieldEnemy.associations._towerFloorEnemy,
        include: [TowerFloorEnemy.associations._enemy],
      },
    ],
    transaction,
  });
}

export function findFloorBattlefieldEnemiesByFloorEnemy(enemyId: number, transaction: Transaction) {
  return TowerFloorBattlefieldEnemy.findAll({
    where: { _towerFloorEnemyId: enemyId },
    include: [
      {
        association: TowerFloorBattlefieldEnemy.associations._towerFloorEnemy,
        include: [TowerFloorEnemy.associations._enemy],
      },
    ],
    transaction,
  });
}

export function findEnemyByFloorBattlefield(
  battlefieldId: number,
  enemyId: number,
  transaction: Transaction
) {
  return TowerFloorBattlefieldEnemy.findOne({
    where: { _towerFloorBattlefieldId: battlefieldId, _towerFloorEnemyId: enemyId },
    transaction,
  });
}

export function findVisibleEnemies(battlefieldId: number, transaction: Transaction) {
  return TowerFloorBattlefieldEnemy.findAll({
    where: { _towerFloorBattlefieldId: battlefieldId, isVisible: true },
    include: [
      {
        association: TowerFloorBattlefieldEnemy.associations._towerFloorEnemy,
        include: [TowerFloorEnemy.associations._enemy],
      },
    ],
    transaction,
  });
}

export async function setAllEnemiesVisibility(
  battlefieldId: number,
  isVisible: boolean,
  transaction: Transaction
) {
  return TowerFloorBattlefieldEnemy.update(
    { isVisible },
    {
      where: { _towerFloorBattlefieldId: battlefieldId },
      transaction,
    }
  );
}

export function addTowerFloorBattlefieldEnemies(
  battlefieldId: number,
  enemies: TowerFloorEnemy[],
  transaction: Transaction
) {
  return Promise.all(
    enemies.map((enemy) => createBattlefieldEnemy(battlefieldId, enemy, transaction))
  );
}

export function createBattlefieldEnemy(
  battlefieldId: number,
  towerFloorEnemy: TowerFloorEnemy,
  transaction: Transaction
) {
  return TowerFloorBattlefieldEnemy.create(
    {
      health: towerFloorEnemy._enemy?.health ?? ZERO,
      abilitiesJSON: towerFloorEnemy._enemy?.abilitiesJSON ?? Ability.defaultProps(),
      isVisible: true,
      _towerFloorBattlefieldId: battlefieldId,
      _towerFloorEnemyId: towerFloorEnemy.id,
    },
    { transaction }
  );
}

export function removeEnemyFromFloorBattlefields(enemyId: number, transaction: Transaction) {
  return TowerFloorBattlefieldEnemy.destroy({
    where: { _towerFloorEnemyId: enemyId },
    transaction,
  });
}
