import { isNumber, sampleSize } from 'lodash';
import type { Association, FindOptions, Transaction } from 'sequelize';
import { Op } from 'sequelize';
import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  DefaultScope,
  ForeignKey,
  Model,
  PrimaryKey,
  Scopes,
  Table,
} from 'sequelize-typescript';

import { USER_ROLE_LEVEL } from '../consts/model';
import {
  MAX_PLAYER_HEALTH,
  MAX_BOSS_HEALTH,
  MAX_AMOUNT_HEALTHKITS_ALLOWED,
} from '../games/arena/consts';
import { Ability, AbilityProperty } from '../games/classes/GameAbilities';
import { GAME_TYPE, ITEM_TYPE, ONE, SLACK_SPACE, TRAIT, ZERO } from '../games/consts/global';
import { GameError } from '../games/utils/GameError';
import { parseEscapedSlackUserValues } from '../utils/slack';

import { addAmmoToItemInInventory, getPlayerItemCount } from './ArenaItemInventory';
import { findAvailableArenaZonesToLand } from './ArenaZone';
import { listActiveWeaponsByGameType } from './ItemWeapon';
import { findOrganizationByName } from './Organization';
import { findArenaPlayersByUserSlackId } from './User';

import type { ArenaRoundAction } from '.';
import { Item, ArenaItemInventory, Game, ArenaZone, Team, User } from '.';

interface ArenaPlayerAttributes {
  id: number;
  _userId: number;
  _gameId: number;
  _teamId: number | null;
  _arenaZoneId: number | null;
  health: number;
  isSpectator: boolean;
  isVisible: boolean;
  isBoss: boolean;
  luckBoost: number;
  abilitiesJSON: AbilityProperty;
}

interface ArenaPlayerCreationAttributes {
  _userId: number;
  _gameId: number;
  _teamId: number | null;
  _arenaZoneId: number | null;
  health: number;
  isSpectator: boolean;
  isBoss: boolean;
  isVisible: boolean;
  luckBoost: number;
  abilitiesJSON: AbilityProperty;
}

function withInventory(allInventory?: boolean): FindOptions {
  return {
    include: allInventory
      ? [
          ArenaPlayer.associations._user,
          {
            association: ArenaPlayer.associations._healthkits,
            include: [Item.associations._healthkit],
            where: {
              type: ITEM_TYPE.HEALTH_KIT,
            },
            as: '_healthkits',
            required: false,
          },
          {
            association: ArenaPlayer.associations._weapons,
            include: [Item.associations._weapon, Item.associations._traits],
            where: {
              type: ITEM_TYPE.WEAPON,
            },
            as: '_weapons',
            required: false,
          },
          {
            association: ArenaPlayer.associations._armors,
            include: [Item.associations._armor],
            where: {
              type: ITEM_TYPE.ARMOR,
            },
            as: '_armors',
            required: false,
          },
          ArenaPlayer.associations._zone,
        ]
      : [
          ArenaPlayer.associations._user,
          ArenaPlayer.associations._team,
          {
            association: ArenaPlayer.associations._armors,
            include: [Item.associations._armor],
            where: {
              type: ITEM_TYPE.ARMOR,
            },
            required: false,
            as: '_armors',
          },
          ArenaPlayer.associations._zone,
        ],
  };
}

@DefaultScope(() => ({
  include: [
    ArenaPlayer.associations._user,
    ArenaPlayer.associations._team,
    ArenaPlayer.associations._zone,
  ],
}))
@Scopes(() => ({
  withInventory,
}))
@Table({
  indexes: [
    {
      unique: true,
      fields: ['_gameId', '_userId'],
    },
    {
      fields: ['_arenaZoneId'],
    },
  ],
})
export class ArenaPlayer
  extends Model<ArenaPlayerAttributes, ArenaPlayerCreationAttributes>
  implements ArenaPlayerAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Default(MAX_PLAYER_HEALTH)
  @Column(DataType.INTEGER)
  declare health: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isSpectator: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isVisible: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isBoss: boolean;

  @Default(ZERO)
  @Column(DataType.DOUBLE)
  declare luckBoost: number;

  @Default(Ability.defaultProps())
  @Column(DataType.JSONB)
  declare abilitiesJSON: AbilityProperty;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare _userId: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _user?: User;

  @AllowNull(true)
  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  declare _teamId: number | null;

  @BelongsTo(() => Team, {
    foreignKey: '_teamId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  _team?: Team | null;

  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  declare _gameId: number;

  @BelongsTo(() => Game, {
    foreignKey: '_gameId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  _game?: Game;

  @AllowNull(true)
  @ForeignKey(() => ArenaZone)
  @Column(DataType.INTEGER)
  declare _arenaZoneId: number | null;

  @BelongsTo(() => ArenaZone)
  _zone?: ArenaZone;

  @BelongsToMany(() => Item, {
    through: () => ArenaItemInventory,
    foreignKey: '_arenaPlayerId',
    otherKey: '_itemId',
    as: '_weapons',
  })
  _weapons?: Array<Item & { ArenaItemInventory: ArenaItemInventory }>;

  @BelongsToMany(() => Item, {
    through: () => ArenaItemInventory,
    foreignKey: '_arenaPlayerId',
    otherKey: '_itemId',
    as: '_armors',
  })
  _armors?: Array<Item & { ArenaItemInventory: ArenaItemInventory }>;

  @BelongsToMany(() => Item, {
    through: () => ArenaItemInventory,
    foreignKey: '_arenaPlayerId',
    otherKey: '_itemId',
    as: '_healthkits',
  })
  _healthkits?: Array<Item & { ArenaItemInventory: ArenaItemInventory }>;

  static associations: {
    _user: Association<ArenaPlayer, User>;
    _game: Association<ArenaPlayer, Game>;
    _team: Association<ArenaPlayer, Team>;
    _zone: Association<ArenaPlayer, ArenaZone>;
    _weapons: Association<ArenaPlayer, Item>;
    _armors: Association<ArenaPlayer, Item>;
    _healthkits: Association<ArenaPlayer, Item>;
  };

  // PLAYER METHODS
  reloadFullInventory(transaction?: Transaction) {
    return this.reload({
      include: [
        ArenaPlayer.associations._user,
        {
          association: ArenaPlayer.associations._healthkits,
          include: [Item.associations._healthkit],
          where: {
            type: ITEM_TYPE.HEALTH_KIT,
          },
          required: false,
          as: '_healthkits',
        },
        {
          association: ArenaPlayer.associations._weapons,
          include: [Item.associations._weapon, Item.associations._traits],
          where: {
            type: ITEM_TYPE.WEAPON,
          },
          required: false,
          as: '_weapons',
        },
        {
          association: ArenaPlayer.associations._armors,
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

  addAbilities(ability: Ability, transaction: Transaction) {
    ability.calculateAbilities(this.abilitiesJSON);
    this.abilitiesJSON = ability.toJSON();
    return this.save({ transaction });
  }

  async setZone(zone: ArenaZone | null, transaction: Transaction) {
    this._arenaZoneId = zone?.id ?? null;
    await this.save({ transaction });
    await this.reload({
      include: [
        ArenaPlayer.associations._user,
        {
          association: ArenaPlayer.associations._healthkits,
          include: [Item.associations._healthkit],
          where: {
            type: ITEM_TYPE.HEALTH_KIT,
          },
          required: false,
          as: '_healthkits',
        },
        {
          association: ArenaPlayer.associations._weapons,
          include: [Item.associations._weapon, Item.associations._traits],
          where: {
            type: ITEM_TYPE.WEAPON,
          },
          required: false,
          as: '_weapons',
        },
        {
          association: ArenaPlayer.associations._armors,
          include: [Item.associations._armor],
          where: {
            type: ITEM_TYPE.ARMOR,
          },
          required: false,
          as: '_armors',
        },
        ArenaPlayer.associations._zone,
      ],
      transaction,
    });
  }

  setAsSpectator(transaction: Transaction) {
    return this.update(
      {
        health: ZERO,
        isVisible: false,
        isSpectator: true,
      },
      { transaction }
    );
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

  // WEAPONS
  async addWeapon(item: Item, transaction: Transaction) {
    // check if Weapon already exists
    const ItemWeaponQty = await getPlayerItemCount({ player: this, item }, transaction);
    if (ItemWeaponQty > ZERO && item.usageLimit !== null) {
      // Add ammo to ItemWeapon when it exists
      const playerWeapon = this._weapons?.find((w) => w.id === item.id)!;
      await addAmmoToItemInInventory({ item: playerWeapon, player: this }, transaction);
    } else if (!ItemWeaponQty) {
      await ArenaItemInventory.create(
        {
          _arenaPlayerId: this.id,
          _itemId: item.id,
          remainingUses: item.usageLimit,
        },
        { transaction }
      );
    }

    return this.reloadFullInventory(transaction);
  }

  useWeapon(weapon: Item & { ArenaItemInventory: ArenaItemInventory }, transaction: Transaction) {
    return this.useItem(weapon, transaction);
  }

  async removeWeapon(weapon: Item, transaction: Transaction) {
    await ArenaItemInventory.destroy({
      where: {
        _arenaPlayerId: this.id,
        _itemId: weapon.id,
      },
      transaction,
    });
    return this.reloadFullInventory(transaction);
  }

  // ARMOR
  async addArmor(item: Item, transaction: Transaction) {
    await ArenaItemInventory.create(
      {
        _arenaPlayerId: this.id,
        _itemId: item.id,
        remainingUses: item.usageLimit,
      },
      { transaction }
    );
    return this.reloadFullInventory(transaction);
  }

  useArmor(armor: Item & { ArenaItemInventory: ArenaItemInventory }, transaction: Transaction) {
    return this.useItem(armor, transaction);
  }

  async removeArmor(armor: Item, transaction: Transaction) {
    await ArenaItemInventory.destroy({
      where: {
        _arenaPlayerId: this.id,
        _itemId: armor.id,
      },
      transaction,
    });
    return this.reloadFullInventory(transaction);
  }

  // HEALTHKITS
  async addHealthkit(itemId: number, quantity: number, transaction: Transaction) {
    const currentQuantity = this.healthkitQty(itemId);
    return setPlayerHealthkitQuantity(this, itemId, currentQuantity + quantity, transaction);
  }

  useHealthkit(
    healthkit: Item & { ArenaItemInventory: ArenaItemInventory },
    transaction: Transaction
  ) {
    return this.useItem(healthkit, transaction);
  }

  async subtractHealthkit(itemId: number, quantity: number, transaction: Transaction) {
    const currentQuantity = this.healthkitQty(itemId);
    return setPlayerHealthkitQuantity(this, itemId, currentQuantity - quantity, transaction);
  }

  healthkitQty(healthkitId: number) {
    const healthkitFound = this._healthkits?.find((healthkit) => healthkit.id === healthkitId);
    if (!healthkitFound) {
      return ZERO;
    }
    return healthkitFound.ArenaItemInventory.remainingUses ?? ZERO;
  }

  hasMaxHealthkits() {
    return Boolean(
      this._healthkits?.find(
        (healthkit) =>
          healthkit.type === ITEM_TYPE.HEALTH_KIT &&
          healthkit.ArenaItemInventory.remainingUses &&
          healthkit.ArenaItemInventory.remainingUses >= MAX_AMOUNT_HEALTHKITS_ALLOWED
      )
    );
  }

  // ITEMS GENERAL PURPOSE
  itemsAvailable(items: Array<Item & { ArenaItemInventory: ArenaItemInventory }> = []) {
    return items.filter((item) => {
      const remainingUses = item.ArenaItemInventory.remainingUses;
      return remainingUses ?? true;
    });
  }

  async useItem(item: Item & { ArenaItemInventory: ArenaItemInventory }, transaction: Transaction) {
    const currentRemainingUses = item.ArenaItemInventory.remainingUses;
    if (isNumber(currentRemainingUses)) {
      const remainingUses = currentRemainingUses - ONE;
      if (remainingUses < ONE) {
        await ArenaItemInventory.destroy({
          where: {
            _arenaPlayerId: this.id,
            _itemId: item.id,
          },
          transaction,
        });
      } else {
        await ArenaItemInventory.update(
          { remainingUses },
          {
            where: {
              _arenaPlayerId: this.id,
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

export async function findPlayerByUser(
  gameId: number,
  userId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({
    method: ['withInventory', includeInventories],
  }).findOne({
    where: { _gameId: gameId, _userId: userId },
    transaction,
  });
}

export async function findPlayerById(
  playerId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({
    method: ['withInventory', includeInventories],
  }).findByPk(playerId, {
    transaction,
  });
}

export async function findPlayersByGame(
  gameId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({
    method: ['withInventory', includeInventories],
  }).findAll({
    where: { _gameId: gameId },
    transaction,
  });
}

export async function findVisiblePlayers(
  gameId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({
    method: ['withInventory', includeInventories],
  }).findAll({
    where: { _gameId: gameId, isVisible: true },
    transaction,
  });
}

export async function findLivingPlayersByGame(
  gameId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({
    method: ['withInventory', includeInventories],
  }).findAll({
    where: { _gameId: gameId, health: { [Op.gt]: ZERO } },
    order: [['health', 'DESC']],
    transaction,
  });
}

export async function findSpectatorsByGame(gameId: number, transaction?: Transaction) {
  return ArenaPlayer.findAll({
    where: { _gameId: gameId, isSpectator: true },
    transaction,
  });
}

interface AddArenaPlayers {
  gameId: number;
  users: User[];
  areBosses: boolean;
}

interface AddArenaPlayer {
  gameId: number;
  user: User;
  isBoss: boolean;
}

export function addArenaPlayers(
  { gameId, users, areBosses }: AddArenaPlayers,
  transaction: Transaction
) {
  return Promise.all(
    users.map((user) => getOrCreatePlayer({ gameId, user, isBoss: areBosses }, transaction))
  );
}

interface FindOrCreateBossOrGuestParams {
  fullSlackIds: string[];
  isBoss: boolean;
  teamName?: string;
  transaction: Transaction;
}

export async function getOrCreateBossesOrGuests({
  fullSlackIds,
  isBoss,
  transaction,
}: FindOrCreateBossOrGuestParams): Promise<User[]> {
  const bossOrGuestUsers: User[] = [];
  for (const fullSlackId of fullSlackIds) {
    const slackId = parseEscapedSlackUserValues(fullSlackId);
    const [slackDisplayedName] = parseEscapedSlackUserValues(fullSlackId, ['username']);
    const emailAdress = slackDisplayedName?.toLowerCase().replace(`${SLACK_SPACE}`, '');
    let mutableUser = await findArenaPlayersByUserSlackId(slackId as string);

    const organizationName = 'x-team'; // This will be dynamic in the future
    const organization = await findOrganizationByName(organizationName, transaction);
    if (!organization) {
      throw GameError.notFound('Organization not Found');
    }
    if (!mutableUser) {
      mutableUser = await User.create({
        email: `${emailAdress}-game-${isBoss ? 'boss' : 'guest'}@${organization.domain}`,
        displayName: slackDisplayedName,
        firebaseUserUid: null,
        slackId: slackId as string,
        profilePictureUrl: 'http://some.url.localhost/avatar.jpg',
        _roleId: USER_ROLE_LEVEL.USER,
        _organizationId: organization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    bossOrGuestUsers.push(mutableUser);
  }
  return bossOrGuestUsers;
}

export async function getOrCreatePlayer(
  { gameId, user, isBoss }: AddArenaPlayer,
  transaction: Transaction
) {
  const bossAbility = new Ability({
    stunBlockRate: ONE,
  });
  const [player] = await ArenaPlayer.findOrCreate({
    where: { _gameId: gameId, _userId: user.id },
    defaults: {
      _gameId: gameId,
      _userId: user.id,
      _teamId: null, // teamId,
      _arenaZoneId: null,
      health: isBoss ? MAX_BOSS_HEALTH : MAX_PLAYER_HEALTH,
      isBoss,
      isVisible: true,
      isSpectator: false,
      luckBoost: ZERO,
      abilitiesJSON: isBoss ? bossAbility.toJSON() : Ability.defaultProps(),
    },
    transaction,
  });

  if (!isBoss) {
    const activeItemWeapons = await listActiveWeaponsByGameType(GAME_TYPE.ARENA, transaction);
    const foundWeapon = activeItemWeapons.filter((weapon) => weapon.hasTrait(TRAIT.INITIAL));
    for (const weapon of foundWeapon) {
      await player.addWeapon(weapon, transaction);
    }
  }
  return player;
}

export async function setAllPlayerVisibility(
  gameId: number,
  isVisible: boolean,
  transaction: Transaction
) {
  return ArenaPlayer.update(
    { isVisible },
    {
      where: { _gameId: gameId },
      transaction,
    }
  );
}

export function addArenaPlayersToZones(
  { arenaPlayers, zones }: { arenaPlayers: ArenaPlayer[]; zones?: ArenaZone[] },
  transaction: Transaction
) {
  return Promise.all(
    arenaPlayers.map(async (player) => {
      const availableZones = zones ?? (await findAvailableArenaZonesToLand(transaction));
      const [zone] = sampleSize(availableZones, ONE);
      await player.setZone(zone, transaction);
    })
  );
}

export function removePlayersFromArenaZones(players: ArenaPlayer[], transaction: Transaction) {
  return ArenaPlayer.update(
    {
      _arenaZoneId: null,
    },
    {
      where: {
        id: {
          [Op.in]: players.map((player) => player.id),
        },
      },
      transaction,
    }
  );
}

export async function getIdlePlayers(
  gameId: number,
  actions: ArenaRoundAction[],
  transaction: Transaction
) {
  const playersWithActions = actions.map((action) => action._player!);
  const playersAlive = await findLivingPlayersByGame(gameId, false, transaction);

  const idlePlayers = playersAlive.filter(compareAndSubtract(playersWithActions));
  return idlePlayers;
}

function compareAndSubtract(subtractPlayers: ArenaPlayer[] = []) {
  return (player: ArenaPlayer) => {
    return (
      subtractPlayers.filter((otherPlayer) => {
        return otherPlayer.id === player.id;
      }).length === ZERO
    );
  };
}

// HEALTHKITS HELPERS
export async function setPlayerHealthkitQuantity(
  player: ArenaPlayer,
  itemId: number,
  quantity: number,
  transaction: Transaction
) {
  if (quantity < ONE) {
    await ArenaItemInventory.destroy({
      where: {
        _arenaPlayerId: player.id,
        _itemId: itemId,
      },
      transaction,
    });
  } else {
    await ArenaItemInventory.upsert(
      {
        _arenaPlayerId: player.id,
        _itemId: itemId,
        remainingUses: quantity,
      },
      { transaction }
    );
  }
  return player.reloadFullInventory(transaction);
}
