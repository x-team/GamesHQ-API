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

import {
  MAX_PLAYER_HEALTH,
  MAX_BOSS_HEALTH,
  MAX_AMOUNT_HEALTHKITS_ALLOWED,
} from '../games/arena/consts';
import { parseEscapedSlackUserValues } from '../utils/slack';

import { addAmmoToInventory, getPlayerItemCount } from './ArenaItemInventory';
import { findAvailableArenaZonesToLand } from './ArenaZone';
import { findActiveTeamByName } from './Team';
import { findArenaPlayersByUserSlackId } from './User';

import {
  Item,
  ItemArmor,
  ItemWeapon,
  ItemTrait,
  ItemHealthKit,
  ArenaItemInventory,
  Game,
  ArenaZone,
  ArenaRoundAction,
  Team,
  User,
} from '.';
import { GAME_TYPE, ITEM_TYPE, ONE, SLACK_SPACE, TRAIT, ZERO } from '../games/consts/global';
import { Ability, AbilityProperty } from '../games/classes/GameAbilities';
import { listActiveWeaponsByGameType } from './ItemWeapon';
import { findOrganizationByName } from './Organization';
import { USER_ROLE_LEVEL } from '../consts/model';

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
          User,
          { model: Item, include: [ItemHealthKit], as: '_healthkits' },
          { model: Item, include: [ItemWeapon, ItemTrait], as: '_weapons' },
          { model: Item, include: [ItemArmor], as: '_armors' },
          ArenaZone,
        ]
      : [User, Team, { model: Item, include: [ItemArmor], as: '_armors' }, ArenaZone],
  };
}

@DefaultScope(() => ({
  include: [User, Team, ArenaZone],
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
  id!: number;

  @Default(MAX_PLAYER_HEALTH)
  @Column(DataType.INTEGER)
  health!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isSpectator!: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isVisible!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isBoss!: boolean;

  @Default(ZERO)
  @Column(DataType.DOUBLE)
  luckBoost!: number;

  @Default(Ability.defaultProps())
  @Column(DataType.JSONB)
  abilitiesJSON!: AbilityProperty;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _userId!: number;

  @BelongsTo(() => User, {
    foreignKey: '_userId',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  _user?: User;

  @AllowNull(true)
  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  _teamId!: number | null;

  @BelongsTo(() => Team, {
    foreignKey: '_teamId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  _team?: Team | null;

  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  _gameId!: number;

  @BelongsTo(() => Game, {
    foreignKey: '_gameId',
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  _game?: Game;

  @AllowNull(true)
  @ForeignKey(() => ArenaZone)
  @Column(DataType.INTEGER)
  _arenaZoneId!: number | null;

  @BelongsTo(() => ArenaZone)
  _zone?: ArenaZone;

  // PENDING:
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
        User,
        { model: Item, include: [ItemHealthKit], as: '_healthkits' },
        { model: Item, include: [ItemWeapon, ItemTrait], as: '_weapons' },
        { model: Item, include: [ItemArmor], as: '_armors' },
      ],
      transaction,
    });
  }

  addAbilities(ability: Ability, transaction: Transaction) {
    ability.calculateAbilities(this.abilitiesJSON);
    this.abilitiesJSON = ability.toJSON();
    return this.save({ transaction });
  }

  async setPlayerZone(zone: ArenaZone | null, transaction: Transaction) {
    this._arenaZoneId = zone?.id ?? null;
    await this.save({ transaction });
    await this.reload({
      include: [
        User,
        { model: Item, include: [ItemHealthKit], as: '_healthkits' },
        { model: Item, include: [ItemWeapon, ItemTrait], as: '_weapons' },
        { model: Item, include: [ItemArmor], as: '_armors' },
        ArenaZone,
      ],
      transaction,
    });
  }

  setAsSpectator(transaction: Transaction) {
    return this.update(
      {
        health: 0,
        isVisible: false,
        isSpectator: true,
      },
      { transaction }
    );
  }

  setPlayerVisibility(isVisible: boolean, transaction: Transaction) {
    return this.isVisible !== isVisible ? this.update({ isVisible }, { transaction }) : this;
  }

  reviveOrHeal(restoredHealth: number, maxHealth: number, transaction: Transaction) {
    return this.update(
      { health: Math.min(this.health + restoredHealth, maxHealth) },
      { transaction }
    );
  }

  isAlive() {
    return this.health > 0;
  }

  isCurrentlyVisible() {
    return this.isVisible;
  }

  damageAndHide(damage: number, isVisible: boolean, transaction: Transaction) {
    return this.update(
      {
        health: Math.max(this.health - damage, 0),
        isVisible,
      },
      { transaction }
    );
  }
  // WEAPONS
  async addWeapon(item: Item, transaction: Transaction) {
    // check if Weapon already exists
    const ItemWeaponQty = await getPlayerItemCount({ player: this, item }, transaction);
    if (ItemWeaponQty > 0 && item.usageLimit !== null) {
      // Add ammo to ItemWeapon when it exists
      const playerWeapon = this._weapons?.find((w) => w.id === item.id)!;
      await addAmmoToInventory({ item: playerWeapon, player: this }, transaction);
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

  async removeArmor(ItemArmor: ItemArmor, transaction: Transaction) {
    await ArenaItemInventory.destroy({
      where: {
        _arenaPlayerId: this.id,
        _itemId: ItemArmor.id,
      },
      transaction,
    });
    return this.reloadFullInventory(transaction);
  }

  // HEALTHKITS
  async addHealthkit(itemId: number, quantity: number, transaction: Transaction) {
    const currentQuantity = await this.healthkitQty(itemId);
    return setPlayerHealthkitQuantity(this, itemId, currentQuantity + quantity, transaction);
  }

  useHealthkit(
    healthkit: Item & { ArenaItemInventory: ArenaItemInventory },
    transaction: Transaction
  ) {
    return this.useItem(healthkit, transaction);
  }

  async subtractHealthkit(itemId: number, quantity: number, transaction: Transaction) {
    const currentQuantity = await this.healthkitQty(itemId);
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
    return items.filter((armor) => {
      const remainingUses = armor.ArenaItemInventory.remainingUses;
      return remainingUses ?? true;
    });
  }

  async useItem(item: Item & { ArenaItemInventory: ArenaItemInventory }, transaction: Transaction) {
    const currentRemainingUses = item.ArenaItemInventory.remainingUses;
    if (isNumber(currentRemainingUses)) {
      const remainingUses = currentRemainingUses - 1;
      if (remainingUses < 1) {
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
    where: { _gameId: gameId, health: { [Op.gt]: 0 } },
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
  teamName,
  transaction,
}: FindOrCreateBossOrGuestParams): Promise<User[]> {
  const bossUsers: User[] = [];
  const team = teamName ? await findActiveTeamByName(teamName) : null;
  for (const fullSlackId of fullSlackIds) {
    const slackId = parseEscapedSlackUserValues(fullSlackId);
    const [slackDisplayedName] = parseEscapedSlackUserValues(fullSlackId, ['username']);
    const emailAdress = slackDisplayedName?.toLowerCase().replace(`${SLACK_SPACE}`, '');
    let mutableUser = await findArenaPlayersByUserSlackId(slackId as string);

    const organizationName = 'x-team'; // This will be dynamic in the future
    const organization = await findOrganizationByName(organizationName, transaction);
    if (!organization) {
      throw Error('Organization not Found');
    }
    if (!mutableUser) {
      mutableUser = await User.create({
        email: `${emailAdress}-game-${isBoss ? 'boss' : 'guest'}@${organization.domain}`,
        displayName: slackDisplayedName,
        slackId: slackId as string,
        profilePictureUrl: 'http://some.url.localhost/avatar.jpg',
        _teamId: team ? team.id : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _organizationId: organization.id,
        _roleId: USER_ROLE_LEVEL.USER,
      });
    } else {
      if (!mutableUser._teamId && team) {
        await mutableUser.setTeam(team, transaction);
        await mutableUser.reload({ transaction });
      }
    }
    bossUsers.push(mutableUser);
  }
  return bossUsers;
}

export async function getOrCreatePlayer(
  { gameId, user, isBoss }: AddArenaPlayer,
  transaction: Transaction
) {
  const bossAbility = new Ability({
    stunBlockRate: 1,
  });
  const [player] = await ArenaPlayer.findOrCreate({
    where: { _gameId: gameId, _userId: user.id },
    defaults: {
      _gameId: gameId,
      _userId: user.id,
      _teamId: user._teamId,
      _arenaZoneId: null,
      health: isBoss ? MAX_BOSS_HEALTH : MAX_PLAYER_HEALTH,
      isBoss,
      isVisible: true,
      isSpectator: false,
      luckBoost: 0,
      abilitiesJSON: isBoss ? bossAbility.toJSON() : Ability.defaultProps(),
    },
    transaction,
  });

  const activeItemWeapons = await listActiveWeaponsByGameType(GAME_TYPE.ARENA, transaction);
  const foundWeapon = activeItemWeapons.filter((weapon) => weapon.hasTrait(TRAIT.INITIAL));
  for (const weapon of foundWeapon) {
    await player.addWeapon(weapon, transaction);
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
      await player.setPlayerZone(zone, transaction);
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
      }).length === 0
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
  if (quantity < 1) {
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
