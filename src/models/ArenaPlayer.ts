import { isNumber } from 'lodash';
import type { FindOptions, Transaction } from 'sequelize';
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

import { USER_TYPE } from '../models-consts';
import {
  ARENA_ITEM,
  LUCK_BOOST,
  LUCK_ELIXIR_BOOST,
  MAX_AMOUNT_ItemHealthkitS_ALLOWED,
  MAX_BOSS_HEALTH,
  MAX_PLAYER_HEALTH,
} from '../plugins/slack-integrations/arena/consts';
import { randomInt } from '../plugins/slack-integrations/arena/utils';
import { SLACK_SPACE } from '../plugins/slack-integrations/games/consts';
import { parseEscapedSlackUserValues } from '../plugins/slack-integrations/utils';

import { addAmmoToInventory, getPlayerItemCount } from './ArenaItemInventory';
import { findAvailableArenaZonesToLand } from './ArenaZone';
import { findActiveTeamByName } from './Team';
import { findArenaUserBySlackId, setTeamToUser } from './User';

import {
  Item,
  ItemArmor,
  ItemWeapon,
  ItemTrait,
  ItemHealthKit,
  ArenaItemInventory,
  ArenaGame,
  ArenaZone,
  ArenaRoundAction,
  Team,
  User,
} from '.';
import { TRAITS } from '../games/consts/global';
import { Ability, AbilityProperty } from '../games/model/GameAbilities';

interface ArenaPlayerAttributes {
  id: number;

}

interface ArenaPlayerCreationAttributes {

}

function withInventory(allInventory?: boolean): FindOptions {
  return {
    include: allInventory
      ? [
          User,
          Item,
          {
            model: ItemWeapon,
            include: [ItemTrait],
          },
          ItemArmor,
          ArenaZone,
        ]
      : [User, ItemArmor, ArenaZone],
  };
}

@DefaultScope({ include: [() => User, () => Team] })
@Scopes({ withInventory })
@Table({
  indexes: [
    {
      unique: true,
      fields: ['_arenaGameId', '_userId'],
    },
    {
      fields: ['_arenaZoneId'],
    },
  ],
})
export class ArenaPlayer extends Model<ArenaPlayerAttributes, ArenaPlayerCreationAttributes>
implements ArenaPlayerAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => ArenaGame)
  @Column(DataType.INTEGER)
  _arenaGameId!: number;

  @BelongsTo(() => ArenaGame)
  _game?: ArenaGame;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  _userId!: number;

  @BelongsTo(() => User)
  _user?: User;

  @AllowNull(true)
  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  _teamId!: number | null;

  @BelongsTo(() => Team, {
    foreignKey: '_teamId',
    onUpdate: 'CASCADE',
  })
  _team?: Team | null;

  @Column(DataType.INTEGER)
  health!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isSpectator!: boolean;

  @Default(0)
  @Column(DataType.DOUBLE)
  luckBoost!: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isVisible!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isBoss!: boolean;

  @Default(Ability.defaultProps())
  @Column(DataType.JSONB)
  abilitiesJSON!: AbilityProperty;

  @AllowNull(true)
  @ForeignKey(() => ArenaZone)
  @Column(DataType.INTEGER)
  _arenaZoneId!: number | null;

  @BelongsTo(() => ArenaZone)
  _zone?: ArenaZone;

  @BelongsToMany(() => ItemWeapon, {
    through: () => ArenaItemInventory,
    foreignKey: '_arenaPlayerId',
    otherKey: '_ItemId',
    as: '_ItemWeapons',
  })
  _ItemWeapons?: Array<ItemWeapon & { ArenaItemInventory: ArenaItemInventory }>;

  @BelongsToMany(() => ItemArmor, {
    through: () => ArenaItemInventory,
    foreignKey: '_arenaPlayerId',
    otherKey: '_ItemId',
    as: '_ItemArmors',
  })
  _ItemArmors?: Array<ItemArmor & { ArenaItemInventory: ArenaItemInventory }>;

  @BelongsToMany(() => ItemHealthKit, {
    through: () => ArenaItemInventory,
    foreignKey: '_arenaPlayerId',
    otherKey: '_ItemId',
    as: '_items',
  })
  _items?: Array<Item & { ArenaItemInventory: ArenaItemInventory }>;

  reloadFullInventory(transaction?: Transaction) {
    return this.reload({
      include: [
        User,
        Item,
        {
          model: ItemWeapon,
          include: [ItemTrait],
        },
        ItemArmor,
      ],
      transaction,
    });
  }

  addAbilities(ability: Ability, transaction: Transaction) {
    ability.calculateAbilities(this.abilitiesJSON);
    this.abilitiesJSON = ability.toJSON();
    return this.save({ transaction });
  }
}

export async function findPlayerByUser(
  gameId: number,
  userId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({ method: ['withInventory', includeInventories] }).findOne({
    where: { _arenaGameId: gameId, _userId: userId },
    transaction,
  });
}

export async function findPlayerById(
  playerId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({ method: ['withInventory', includeInventories] }).findByPk(playerId, {
    transaction,
  });
}

export async function findPlayersByGame(
  gameId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({ method: ['withInventory', includeInventories] }).findAll({
    where: { _arenaGameId: gameId },
    transaction,
  });
}

export async function findVisiblePlayers(
  gameId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({ method: ['withInventory', includeInventories] }).findAll({
    where: { _arenaGameId: gameId, isVisible: true },
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
    let mutableUser = await findArenaUserBySlackId(slackId as string);

    if (!mutableUser) {
      mutableUser = await User.create({
        email: `${emailAdress}-game-${isBoss ? 'boss' : 'guest'}@x-team.com`,
        displayName: slackDisplayedName,
        isActive: true,
        slackId,
        avatarUrl: 'http://some.url.localhost/avatar.jpg',
        _roleId: 1,
        _typeId: USER_TYPE.DEVELOPER,
        _currencyId: 1,
        _teamId: team?.id,
      });
    } else {
      if (!mutableUser._teamId && team) {
        await setTeamToUser(mutableUser, team, transaction);
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
    where: { _arenaGameId: gameId, _userId: user.id },
    defaults: {
      _arenaGameId: gameId,
      _userId: user.id,
      isBoss,
      health: isBoss ? MAX_BOSS_HEALTH : MAX_PLAYER_HEALTH,
      isVisible: true,
      _teamId: user._teamId,
      abilitiesJSON: isBoss ? bossAbility : Ability.defaultProps(),
    },
    transaction,
  });

  const activeItemWeapons = await listActiveItemWeapons();
  const foundItemWeapons = activeItemWeapons.filter((ItemWeapon) => ItemWeapon.hasItemTrait(TRAITS.INITIAL))!;
  for (const ItemWeapon of foundItemWeapons) {
    await addPlayerItemWeapon(player, ItemWeapon, transaction);
  }
  return player;
}

export async function setPlayerVisibility(
  player: ArenaPlayer,
  isVisible: boolean,
  transaction: Transaction
) {
  return player.isVisible !== isVisible ? player.update({ isVisible }, { transaction }) : player;
}

export async function setAllPlayerVisibility(
  gameId: number,
  isVisible: boolean,
  transaction: Transaction
) {
  return ArenaPlayer.update(
    { isVisible },
    {
      where: { _arenaGameId: gameId },
      transaction,
    }
  );
}

export async function getPlayerItemQty(
  playerId: number,
  itemId: number,
  transaction?: Transaction
) {
  const inventoryEntry = await ArenaItemInventory.findOne({
    where: { _arenaPlayerId: playerId, _ItemId: itemId },
    transaction,
  });
  return inventoryEntry?.quantity ?? 0;
}

export async function addPlayerItem(
  player: ArenaPlayer,
  itemId: number,
  quantity: number,
  transaction: Transaction
) {
  const currentQuantity = await getPlayerItemQty(player.id, itemId, transaction);
  return setPlayerItemQuantity(player, itemId, currentQuantity + quantity, transaction);
}

export async function subtractPlayerItem(
  player: ArenaPlayer,
  itemId: number,
  quantity: number,
  transaction: Transaction
) {
  const currentQuantity = await getPlayerItemQty(player.id, itemId, transaction);
  return setPlayerItemQuantity(player, itemId, currentQuantity - quantity, transaction);
}

export async function setPlayerItemQuantity(
  player: ArenaPlayer,
  itemId: number,
  quantity: number,
  transaction: Transaction
) {
  if (quantity < 1) {
    await ArenaItemInventory.destroy({
      where: {
        _arenaPlayerId: player.id,
        _ItemId: itemId,
      },
      transaction,
    });
  } else {
    await ArenaItemInventory.upsert(
      {
        _arenaPlayerId: player.id,
        _ItemId: itemId,
        quantity,
      },
      { transaction }
    );
  }
  return player.reload({
    include: [User, Item, ItemWeapon, ItemArmor],
    transaction,
  });
}
// ItemArmor
export function ItemArmorsAvailable(
  ItemArmors: Array<ItemArmor & { ArenaItemInventory: ArenaItemInventory }> = []
) {
  return ItemArmors.filter((ItemArmor) => {
    const remainingUses = ItemArmor.ArenaItemInventory.remainingUses;
    return remainingUses != null ? remainingUses : true;
  });
}

export async function getPlayerItemArmors(playerId: number, transaction?: Transaction) {
  return ArenaItemInventory.findAll({
    where: {
      _arenaPlayerId: playerId,
      _ItemId: {
        [Op.ne]: null,
      },
    },
    transaction,
  });
}

export async function addPlayerItemArmor(
  player: ArenaPlayer,
  ItemArmor: ItemArmor,
  transaction: Transaction
) {
  await ArenaItemInventory.create(
    {
      _arenaPlayerId: player.id,
      _ItemId: ItemArmor.id,
      remainingUses: ItemArmor.usageLimit,
    },
    { transaction }
  );
  return player.reload({
    include: [User, Item, ItemWeapon, ItemArmor],
    transaction,
  });
}

export async function removePlayerItemArmor(
  player: ArenaPlayer,
  ItemArmor: ItemArmor,
  transaction: Transaction
) {
  await ArenaItemInventory.destroy({
    where: {
      _arenaPlayerId: player.id,
      _ItemId: ItemArmor.id,
    },
    transaction,
  });
  return player.reload({
    include: [User, Item, ItemWeapon, ItemArmor],
    transaction,
  });
}

export async function usePlayerItemArmor(
  player: ArenaPlayer,
  ItemArmor: ItemArmor & { ArenaItemInventory: ArenaItemInventory },
  transaction: Transaction
) {
  const currentRemainingUses = ItemArmor.ArenaItemInventory.remainingUses;
  if (isNumber(currentRemainingUses)) {
    const remainingUses = currentRemainingUses - 1;
    if (remainingUses < 1) {
      await ArenaItemInventory.destroy({
        where: {
          _arenaPlayerId: player.id,
          _ItemId: ItemArmor.id,
        },
        transaction,
      });
    } else {
      await ArenaItemInventory.update(
        { remainingUses },
        {
          where: {
            _arenaPlayerId: player.id,
            _ItemId: ItemArmor.id,
          },
          transaction,
        }
      );
    }
  }
  return player.reload({
    include: [User, Item, ItemWeapon, ItemArmor],
    transaction,
  });
}

// ItemWeapon
export async function addPlayerItemWeapon(
  player: ArenaPlayer,
  ItemWeapon: ItemWeapon,
  transaction: Transaction
) {
  // check if ItemWeapon already exists
  const ItemWeaponQty = await getPlayerItemWeaponCount({ player, ItemWeapon }, transaction);

  if (ItemWeaponQty > 0 && ItemWeapon.usageLimit !== null) {
    // Add ammo to ItemWeapon when it exists
    const playerItemWeapon = player._ItemWeapons?.find((w) => w.id === ItemWeapon.id)!;
    await addAmmoToInventory({ ItemWeapon: playerItemWeapon, player }, transaction);
  } else if (!ItemWeaponQty) {
    await ArenaItemInventory.create(
      {
        _arenaPlayerId: player.id,
        _ItemId: ItemWeapon.id,
        remainingUses: ItemWeapon.usageLimit,
      },
      { transaction }
    );
  }

  return player.reloadFullInventory(transaction);
}

export async function getPlayerItemWeaponQty(playerId: number, transaction?: Transaction) {
  return ArenaItemInventory.count({
    where: { _arenaPlayerId: playerId },
    transaction,
  });
}

export async function getPlayerItemWeapons(playerId: number, transaction?: Transaction) {
  return ArenaItemInventory.findAll({
    where: {
      _arenaPlayerId: playerId,
      _ItemId: {
        [Op.ne]: null,
      },
    },
    include: [ItemTrait],
    transaction,
  });
}

export function ItemWeaponsAvailable(
  ItemWeapons: Array<ItemWeapon & { ArenaItemInventory: ArenaItemInventory }> = []
) {
  return ItemWeapons.filter((ItemWeapon) => {
    const remainingUses = ItemWeapon.ArenaItemInventory.remainingUses;
    return remainingUses != null ? remainingUses : true;
  });
}

export async function usePlayerItemWeapon(
  player: ArenaPlayer,
  ItemWeapon: ItemWeapon & { ArenaItemInventory: ArenaItemInventory },
  transaction: Transaction
) {
  const currentRemaningUses = ItemWeapon.ArenaItemInventory.remainingUses;
  if (isNumber(currentRemaningUses)) {
    const remainingUses = currentRemaningUses - 1;
    if (remainingUses < 1) {
      await ArenaItemInventory.destroy({
        where: {
          _arenaPlayerId: player.id,
          _ItemId: ItemWeapon.id,
        },
        transaction,
      });
    } else {
      await ArenaItemInventory.update(
        { remainingUses },
        {
          where: {
            _arenaPlayerId: player.id,
            _ItemId: ItemWeapon.id,
          },
          transaction,
        }
      );
    }
  }
  return player.reload({
    include: [User, Item, ItemWeapon, ItemArmor],
    transaction,
  });
}

export async function reviveOrHeal(
  player: ArenaPlayer,
  restoredHealth: number,
  maxHealth: number,
  transaction: Transaction
) {
  await player.update(
    { health: Math.min(player.health + restoredHealth, maxHealth) },
    { transaction }
  );
}

export function isPlayerAlive(player: ArenaPlayer) {
  return player.health > 0;
}

export function isPlayerVisible(player: ArenaPlayer) {
  return player.isVisible;
}

export async function damageAndHidePlayer(
  player: ArenaPlayer,
  damage: number,
  isVisible: boolean,
  transaction: Transaction
) {
  await player.update(
    {
      health: Math.max(player.health - damage, 0),
      isVisible,
    },
    { transaction }
  );
}

export async function findLivingPlayersByGame(
  gameId: number,
  includeInventories: boolean,
  transaction?: Transaction
) {
  return ArenaPlayer.scope({ method: ['withInventory', includeInventories] }).findAll({
    where: { _arenaGameId: gameId, health: { [Op.gt]: 0 } },
    order: [['health', 'DESC']],
    transaction,
  });
}

export async function findSpectatorsByGame(gameId: number, transaction?: Transaction) {
  return ArenaPlayer.findAll({
    where: { _arenaGameId: gameId, isSpectator: true },
    transaction,
  });
}

export function hasMaxItemHealthkits(player: ArenaPlayer) {
  return Boolean(
    player._items?.find(
      (item) =>
        item.name === ARENA_ITEM.HEALTH_KIT &&
        item.ArenaItemInventory.quantity >= MAX_AMOUNT_ItemHealthkitS_ALLOWED
    )
  );
}

export async function boostLuck(player: ArenaPlayer, transaction: Transaction) {
  await boostCustomLuck(player, LUCK_BOOST, transaction);
}

export async function boostLuckWithElixir(player: ArenaPlayer, transaction: Transaction) {
  await boostCustomLuck(player, LUCK_ELIXIR_BOOST, transaction);
}

export async function boostCustomLuck(
  player: ArenaPlayer,
  luckBoost: number,
  transaction: Transaction
) {
  await player.increment({ luckBoost }, { transaction });
  await player.reload({ transaction });
}

export function addArenaPlayersToZones(
  { arenaPlayers, zones }: { arenaPlayers: ArenaPlayer[]; zones?: ArenaZone[] },
  transaction: Transaction
) {
  return Promise.all(
    arenaPlayers.map(async (player) => {
      const availableZones = zones ?? (await findAvailableArenaZonesToLand(transaction));
      const zone = availableZones[randomInt(availableZones.length)];
      await setPlayerZone({ player, zone }, transaction);
    })
  );
}

export async function setPlayerZone(
  { player, zone }: { player: ArenaPlayer; zone?: ArenaZone },
  transaction: Transaction
) {
  player._arenaZoneId = zone?.id ?? null;
  await player.save({ transaction });
  await player.reload({
    include: [User, Item, ItemWeapon, ItemArmor, ArenaZone],
    transaction,
  });
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
