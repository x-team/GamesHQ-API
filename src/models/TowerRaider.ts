import { isNumber } from 'lodash';
import type { Transaction, FindOptions, Association } from 'sequelize';
import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  BelongsToMany,
  BelongsTo,
  ForeignKey,
  Scopes,
  AutoIncrement,
  PrimaryKey,
} from 'sequelize-typescript';

import { listActiveWeaponsByGameType } from './ItemWeapon';
import { perkImpactCalculator } from './Perk';
import { setPerkInventoryQuantity } from './PerkInventory';
import { Item, User, TowerFloorBattlefield, TowerItemInventory, Perk, PerkInventory } from '.';
import { GAME_TYPE, ITEM_TYPE, ONE, PERK, TRAIT, ZERO } from '../games/consts/global';
import { Ability, AbilityProperty, AbilityPropertyKeys } from '../games/classes/GameAbilities';
import { addAmmoToItemInInventory, getRaiderItemCount } from './TowerItemInventory';
import {
  INITIATIVE_DECREASE,
  INITIATIVE_INCREASE,
  LUCK_ELIXIR_BOOST,
  MAX_AMOUNT_HEALTHKITS_ALLOWED,
  MAX_RAIDER_HEALTH,
} from '../games/tower/consts';

interface TowerRaiderAttributes {
  id: number;
  health: number;
  isVisible: boolean;
  luckBoost: number;
  abilitiesJSON: AbilityProperty;
  _userId: number;
  _towerFloorBattlefieldId: number | null;
}

interface TowerRaiderCreationAttributes {
  health: number;
  isVisible: boolean;
  luckBoost: number;
  abilitiesJSON: AbilityProperty;
  _userId: number;
  _towerFloorBattlefieldId?: number;
}

function withInventory(allInventory?: boolean): FindOptions {
  return {
    include: allInventory
      ? [
          TowerRaider.associations._user,
          {
            association: TowerRaider.associations._healthkits,
            include: [Item.associations._healthkit],
            where: {
              type: ITEM_TYPE.HEALTH_KIT,
            },
            as: '_healthkits',
            required: false,
          },
          {
            association: TowerRaider.associations._weapons,
            include: [Item.associations._weapon, Item.associations._traits],
            where: {
              type: ITEM_TYPE.WEAPON,
            },
            as: '_weapons',
            required: false,
          },
          {
            association: TowerRaider.associations._armors,
            include: [Item.associations._armor],
            where: {
              type: ITEM_TYPE.ARMOR,
            },
            as: '_armors',
            required: false,
          },
        ]
      : [
          TowerRaider.associations._user,
          {
            association: TowerRaider.associations._armors,
            include: [Item.associations._armor],
            where: {
              type: ITEM_TYPE.ARMOR,
            },
            required: false,
            as: '_armors',
          },
        ],
  };
}

@Scopes(() => ({
  withInventory,
}))
@Table({
  indexes: [
    {
      fields: ['_towerFloorBattlefieldId', '_userId'],
    },
    {
      fields: ['_towerFloorBattlefieldId'],
    },
    {
      fields: ['_userId'],
    },
  ],
})
export class TowerRaider
  extends Model<TowerRaiderAttributes, TowerRaiderCreationAttributes>
  implements TowerRaiderAttributes
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
  @Column(DataType.DOUBLE)
  luckBoost!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _userId!: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _user?: User;

  @ForeignKey(() => TowerFloorBattlefield)
  @Column(DataType.INTEGER)
  _towerFloorBattlefieldId!: number | null;

  @BelongsTo(() => TowerFloorBattlefield, {
    foreignKey: '_towerFloorBattlefieldId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  _currentTowerFloorBattlefield?: TowerFloorBattlefield;

  @BelongsToMany(() => Item, {
    through: () => TowerItemInventory,
    foreignKey: '_towerRaiderId',
    otherKey: '_itemId',
    as: '_weapons',
  })
  _weapons?: Array<Item & { TowerItemInventory: TowerItemInventory }>;

  @BelongsToMany(() => Item, {
    through: () => TowerItemInventory,
    foreignKey: '_towerRaiderId',
    otherKey: '_itemId',
    as: '_armors',
  })
  _armors?: Array<Item & { TowerItemInventory: TowerItemInventory }>;

  @BelongsToMany(() => Item, {
    through: () => TowerItemInventory,
    foreignKey: '_towerRaiderId',
    otherKey: '_itemId',
    as: '_healthkits',
  })
  _healthkits?: Array<Item & { TowerItemInventory: TowerItemInventory }>;

  @BelongsToMany(() => Perk, {
    through: () => PerkInventory,
    foreignKey: '_towerRaiderId',
    otherKey: '_perkId',
    as: '_perks',
  })
  _perks?: Array<Perk & { PerkInventory: PerkInventory }>;

  @Default(Ability.defaultProps())
  @Column(DataType.JSONB)
  abilitiesJSON!: AbilityProperty;

  static associations: {
    _user: Association<TowerRaider, User>;
    _currentTowerFloorBattlefield: Association<TowerRaider, TowerFloorBattlefield>;
    _weapons: Association<TowerRaider, Item>;
    _armors: Association<TowerRaider, Item>;
    _healthkits: Association<TowerRaider, Item>;
    _perks: Association<TowerRaider, Perk>;
  };

  // RAIDER METHODS
  reloadFullInventory(transaction?: Transaction) {
    return this.reload({
      include: [
        TowerRaider.associations._user,
        TowerRaider.associations._perks,
        {
          association: TowerRaider.associations._healthkits,
          include: [Item.associations._healthkit],
          where: {
            type: ITEM_TYPE.HEALTH_KIT,
          },
          required: false,
          as: '_healthkits',
        },
        {
          association: TowerRaider.associations._weapons,
          include: [Item.associations._weapon, Item.associations._traits],
          where: {
            type: ITEM_TYPE.WEAPON,
          },
          required: false,
          as: '_weapons',
        },
        {
          association: TowerRaider.associations._armors,
          include: [Item.associations._armor],
          where: {
            type: ITEM_TYPE.ARMOR,
          },
          required: false,
          as: '_armors',
        },
      ],
      transaction,
    });
  }

  async resetFullInventory(transaction: Transaction) {
    const raidersInventory = this.itemsAvailable([
      ...(this._weapons ?? []),
      ...(this._armors ?? []),
      ...(this._healthkits ?? []),
    ]);
    const raidersPerks = this._perks || [];
    await Promise.all(
      raidersInventory.map((weapon) =>
        TowerItemInventory.destroy({
          where: {
            _towerRaiderId: this.id,
            _itemId: weapon.id,
          },
          transaction,
        })
      )
    );
    await Promise.all(
      raidersPerks.map((raidersPerk) =>
        setPerkInventoryQuantity(
          { raiderId: this.id, perkId: raidersPerk.id, quantity: ZERO },
          transaction
        )
      )
    );
  }

  addAbilities(ability: Ability, transaction: Transaction) {
    ability.calculateAbilities(this.abilitiesJSON);
    this.abilitiesJSON = ability.toJSON();
    return this.save({ transaction });
  }

  addOrSubtractInitiative(operation: string = 'add' || 'sub', transaction: Transaction) {
    const DECIMAL_PLACES = 2;
    const generatedAbilities = perkImpactCalculator({ raider: this }).toJSON();
    const newAbility = new Ability({
      initiative:
        operation === 'add'
          ? INITIATIVE_INCREASE + generatedAbilities.initiativeBonus
          : INITIATIVE_DECREASE,
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
    return this.save({ transaction });
  }

  async boostLuck(transaction: Transaction) {
    await boostCustomLuck(this, LUCK_ELIXIR_BOOST, transaction);
  }

  async setRaidersBattlefield(battlefieldId: number, transaction: Transaction) {
    this._towerFloorBattlefieldId = battlefieldId;
    return this.save({ transaction });
  }

  setVisibility(isVisible: boolean, transaction: Transaction) {
    return this.isVisible !== isVisible ? this.update({ isVisible }, { transaction }) : this;
  }

  reviveOrHeal(restoredHealth: number, maxHealth: number, transaction: Transaction) {
    return this.update(
      { health: Math.min(this.health + restoredHealth, maxHealth) },
      { transaction }
    );
  }

  isAlive() {
    return this.health > ZERO;
  }

  isCurrentlyVisible() {
    return this.isVisible;
  }

  damageAndHide(damage: number, isVisible: boolean, transaction: Transaction) {
    return this.update(
      {
        health: Math.max(this.health - damage, ZERO),
        isVisible,
      },
      { transaction }
    );
  }

  // PERKS
  async addPerk(perk: Perk, transaction: Transaction) {
    const currentQuantity = await this.getPerkQty(perk.id);
    await setPerkInventoryQuantity(
      {
        raiderId: this.id,
        perkId: perk.id,
        quantity: currentQuantity + ONE,
      },
      transaction
    );
    return this.save({ transaction });
  }

  async getPerkQty(perkId: PERK) {
    const perkFound = this._perks?.find((perk) => perk.id === perkId);
    if (!perkFound) {
      return ZERO;
    }
    return perkFound.PerkInventory.quantity ?? ZERO;
  }

  // WEAPONS
  async addWeapon(item: Item, transaction: Transaction) {
    // check if Weapon already exists
    const ItemWeaponQty = await getRaiderItemCount({ raider: this, item }, transaction);
    if (ItemWeaponQty > ZERO && item.usageLimit !== null) {
      // Add ammo to ItemWeapon when it exists
      const playerWeapon = this._weapons?.find((w) => w.id === item.id)!;
      await addAmmoToItemInInventory({ item: playerWeapon, raider: this }, transaction);
    } else if (!ItemWeaponQty) {
      await TowerItemInventory.create(
        {
          _towerRaiderId: this.id,
          _itemId: item.id,
          remainingUses: item.usageLimit,
        },
        { transaction }
      );
    }

    return this.reloadFullInventory(transaction);
  }

  useWeapon(weapon: Item & { TowerItemInventory: TowerItemInventory }, transaction: Transaction) {
    return this.useItem(weapon, transaction);
  }

  async removeWeapon(weapon: Item, transaction: Transaction) {
    await TowerItemInventory.destroy({
      where: {
        _towerRaiderId: this.id,
        _itemId: weapon.id,
      },
      transaction,
    });
    return this.reloadFullInventory(transaction);
  }

  // ARMOR
  async addArmor(item: Item, transaction: Transaction) {
    await TowerItemInventory.create(
      {
        _towerRaiderId: this.id,
        _itemId: item.id,
        remainingUses: item.usageLimit,
      },
      { transaction }
    );
    return this.reloadFullInventory(transaction);
  }

  useArmor(armor: Item & { TowerItemInventory: TowerItemInventory }, transaction: Transaction) {
    return this.useItem(armor, transaction);
  }

  async removeArmor(armor: Item, transaction: Transaction) {
    await TowerItemInventory.destroy({
      where: {
        _towerRaiderId: this.id,
        _itemId: armor.id,
      },
      transaction,
    });
    return this.reloadFullInventory(transaction);
  }

  // HEALTHKITS
  async addHealthkit(itemId: number, quantity: number, transaction: Transaction) {
    const currentQuantity = await this.healthkitQty(itemId);
    return setRaiderrHealthkitQuantity(this, itemId, currentQuantity + quantity, transaction);
  }

  useHealthkit(
    healthkit: Item & { TowerItemInventory: TowerItemInventory },
    transaction: Transaction
  ) {
    return this.useItem(healthkit, transaction);
  }

  async subtractHealthkit(itemId: number, quantity: number, transaction: Transaction) {
    const currentQuantity = await this.healthkitQty(itemId);
    return setRaiderrHealthkitQuantity(this, itemId, currentQuantity - quantity, transaction);
  }

  healthkitQty(healthkitId: number) {
    const healthkitFound = this._healthkits?.find((healthkit) => healthkit.id === healthkitId);
    if (!healthkitFound) {
      return ZERO;
    }
    return healthkitFound.TowerItemInventory.remainingUses ?? ZERO;
  }

  hasMaxHealthkits() {
    return Boolean(
      this._healthkits?.find(
        (healthkit) =>
          healthkit.type === ITEM_TYPE.HEALTH_KIT &&
          healthkit.TowerItemInventory.remainingUses &&
          healthkit.TowerItemInventory.remainingUses >= MAX_AMOUNT_HEALTHKITS_ALLOWED
      )
    );
  }

  // ITEMS GENERAL PURPOSE
  itemsAvailable(items: Array<Item & { TowerItemInventory: TowerItemInventory }> = []) {
    return items.filter((item) => {
      const remainingUses = item.TowerItemInventory.remainingUses;
      return remainingUses ?? true;
    });
  }

  async useItem(item: Item & { TowerItemInventory: TowerItemInventory }, transaction: Transaction) {
    const currentRemainingUses = item.TowerItemInventory.remainingUses;
    if (isNumber(currentRemainingUses)) {
      const remainingUses = currentRemainingUses - ONE;
      if (remainingUses < ONE) {
        await TowerItemInventory.destroy({
          where: {
            _towerRaiderId: this.id,
            _itemId: item.id,
          },
          transaction,
        });
      } else {
        await TowerItemInventory.update(
          { remainingUses },
          {
            where: {
              _towerRaiderId: this.id,
              _itemId: item.id,
            },
            transaction,
          }
        );
      }
    }
    return this.reloadFullInventory(transaction);
  }
}

export async function findRaiderByUser(
  userId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return TowerRaider.scope({ method: ['withInventory', includeInventories] }).findOne({
    where: { _userId: userId },
    order: [['id', 'DESC']],
    transaction,
  });
}

export async function findRaiderById(
  raiderId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return TowerRaider.scope({ method: ['withInventory', includeInventories] }).findByPk(raiderId, {
    transaction,
  });
}

export async function findRaidersByFloorBattlefield(
  battlefieldId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return TowerRaider.scope({ method: ['withInventory', includeInventories] }).findAll({
    where: { _towerFloorBattlefieldId: battlefieldId },
    transaction,
  });
}

export async function findVisibleRaiders(
  battlefieldId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return TowerRaider.scope({ method: ['withInventory', includeInventories] }).findAll({
    where: { _towerFloorBattlefieldId: battlefieldId, isVisible: true },
    transaction,
  });
}

export function addTowerFloorBattlefieldUsers(
  battlefieldId: number,
  users: User[],
  transaction: Transaction
) {
  return Promise.all(users.map((user) => getOrcreateRaider(battlefieldId, user, transaction)));
}

export function addRaidersToTowerFloorBattlefield(
  battlefieldId: number,
  raiders: TowerRaider[],
  transaction: Transaction
) {
  return Promise.all(
    raiders.map((raider) => raider.setRaidersBattlefield(battlefieldId, transaction))
  );
}

export async function getOrcreateRaider(
  battlefieldId: number,
  user: User,
  transaction: Transaction
) {
  const INITIAL_STUN_BLOCK_RESISTANCE = 0.3; // 30%
  const defaulRaiderAbilities = new Ability({ stunBlockRate: INITIAL_STUN_BLOCK_RESISTANCE });
  const raiderFound: TowerRaider | null = await TowerRaider.findOne({
    where: { _userId: user.id },
    transaction,
  });

  const activeWeapons = await listActiveWeaponsByGameType(GAME_TYPE.TOWER, transaction);
  const foundWeapons = activeWeapons.filter((weapon) => weapon.hasTrait(TRAIT.INITIAL))!;
  if (raiderFound) {
    raiderFound._towerFloorBattlefieldId = battlefieldId;
    raiderFound.health = MAX_RAIDER_HEALTH;
    raiderFound.isVisible = true;
    raiderFound.luckBoost = ZERO;
    raiderFound.abilitiesJSON = defaulRaiderAbilities.toJSON();
    await raiderFound.save({ transaction });
    for (const weapon of foundWeapons) {
      await raiderFound.addWeapon(weapon, transaction);
    }
    return raiderFound.reload({
      include: [TowerRaider.associations._user],
      transaction,
    });
  } else {
    const newTowerRaider = await TowerRaider.create({
      _userId: user.id,
      health: MAX_RAIDER_HEALTH,
      isVisible: true,
      luckBoost: ZERO,
      abilitiesJSON: defaulRaiderAbilities.toJSON(),
    });
    newTowerRaider._towerFloorBattlefieldId = battlefieldId;
    await newTowerRaider.save({ transaction });
    for (const weapon of foundWeapons) {
      await newTowerRaider.addWeapon(weapon, transaction);
    }
    return newTowerRaider.reload({
      include: [TowerRaider.associations._user],
      transaction,
    });
  }
}

// LUCK BOOST
export async function boostCustomLuck(
  raider: TowerRaider,
  luckBoost: number,
  transaction: Transaction
) {
  const maxLuck = 1;
  await raider.update(
    { luckBoost: Math.min(raider.luckBoost + luckBoost, maxLuck) },
    { transaction }
  );
}

// HEALTHKITS HELPERS
export async function setRaiderrHealthkitQuantity(
  riader: TowerRaider,
  itemId: number,
  quantity: number,
  transaction: Transaction
) {
  if (quantity < ONE) {
    await TowerItemInventory.destroy({
      where: {
        _towerRaiderId: riader.id,
        _itemId: itemId,
      },
      transaction,
    });
  } else {
    await TowerItemInventory.upsert(
      {
        _towerRaiderId: riader.id,
        _itemId: itemId,
        remainingUses: quantity,
      },
      { transaction }
    );
  }
  return riader.reloadFullInventory(transaction);
}
