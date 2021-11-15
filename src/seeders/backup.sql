CREATE TABLE IF NOT EXISTS "GameType" ("id" TEXT, PRIMARY KEY ("id"));
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'GameType'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "UserRole" (
  "id" INTEGER UNIQUE,
  "name" TEXT UNIQUE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'UserRole'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"user_role_name" ON "UserRole" ("name");

CREATE TABLE IF NOT EXISTS "Organization" (
  "id" SERIAL,
  "name" TEXT UNIQUE,
  "domain" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT '2021-11-12 16:05:12.973 +00:00',
  "clientSecret" TEXT,
  "signingSecret" TEXT,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'Organization'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"organization_name" ON "Organization" ("name");
CREATE INDEX IF NOT EXISTS"organization_domain" ON "Organization" ("domain");

CREATE TABLE IF NOT EXISTS "Team" (
  "id" SERIAL,
  "name" TEXT UNIQUE,
  "emoji" TEXT DEFAULT NULL,
  "addedAt" TIMESTAMP WITH TIME ZONE DEFAULT '2021-11-12 16:05:12.974 +00:00',
  "health" INTEGER,
  "slackWebhook" TEXT DEFAULT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "_organizationId" INTEGER REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'Team'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"team_name" ON "Team" ("name");

CREATE TABLE IF NOT EXISTS "User" (
  "id" SERIAL,
  "displayName" TEXT,
  "email" TEXT UNIQUE,
  "slackId" TEXT,
  "profilePictureUrl" TEXT,
  "_roleId" INTEGER REFERENCES "UserRole" ("id") ON DELETE
  SET
    NULL ON UPDATE CASCADE,
    "_teamId" INTEGER REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "_organizationId" INTEGER REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'User'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"user_email" ON "User" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS"user_slack_id" ON "User" ("slackId");
CREATE INDEX IF NOT EXISTS"user_created_at" ON "User" ("createdAt");
CREATE INDEX IF NOT EXISTS"user__role_id" ON "User" ("_roleId");
CREATE INDEX IF NOT EXISTS"user__team_id" ON "User" ("_teamId");

CREATE TABLE IF NOT EXISTS "Game" (
  "id" SERIAL,
  "name" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "startedAt" TIMESTAMP WITH TIME ZONE,
  "endedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "_gameTypeId" TEXT REFERENCES "GameType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_createdById" INTEGER REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'Game'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"game_name" ON "Game" ("name");
CREATE INDEX IF NOT EXISTS"game_is_active" ON "Game" ("isActive");

CREATE TABLE IF NOT EXISTS "ArenaGame" (
  "id" SERIAL,
  "hasZoneDeactivation" BOOLEAN DEFAULT TRUE,
  "teamBased" BOOLEAN DEFAULT false,
  "ringSystemAlgorithm" TEXT DEFAULT '5',
  "currentRingDeactivation" INTEGER DEFAULT 1,
  "inactiveZonePenaltyPower" INTEGER DEFAULT 0,
  "_gameId" INTEGER UNIQUE REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ArenaGame'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"arena_game__game_id" ON "ArenaGame" ("_gameId");

CREATE TABLE IF NOT EXISTS "ArenaZone" (
  "id" SERIAL,
  "name" TEXT UNIQUE,
  "isActive" BOOLEAN DEFAULT TRUE,
  "isArchived" BOOLEAN DEFAULT false,
  "emoji" TEXT,
  "ring" TEXT,
  "_organizationId" INTEGER REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ArenaZone'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"arena_zone_name" ON "ArenaZone" ("name");
CREATE INDEX IF NOT EXISTS"arena_zone_ring" ON "ArenaZone" ("ring");

CREATE TABLE IF NOT EXISTS "ArenaPlayer" (
  "id" SERIAL,
  "health" INTEGER DEFAULT 100,
  "isSpectator" BOOLEAN DEFAULT false,
  "isVisible" BOOLEAN DEFAULT TRUE,
  "isBoss" BOOLEAN DEFAULT false,
  "luckBoost" DOUBLE PRECISION DEFAULT '0',
  "abilitiesJSON" JSONB DEFAULT '{"rarityRateBonus":0,"searchRate":0,"healthkitSearchRate":0,"armorSearchRate":0,"weaponSearchRate":0,"accuracy":0,"flatAttackBonus":0,"flatDefenseBonus":0,"attackRate":0,"defenseRate":0,"stunBlockRate":0,"stunOthersRate":0,"evadeRate":0,"initiative":1,"initiativeBonus":0,"flatHealingBoost":0}',
  "_userId" INTEGER REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_teamId" INTEGER REFERENCES "Team" ("id") ON DELETE
  SET
    NULL ON UPDATE CASCADE,
    "_gameId" INTEGER REFERENCES "ArenaGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "_arenaZoneId" INTEGER REFERENCES "ArenaZone" ("id") ON DELETE
  SET
    NULL ON UPDATE CASCADE,
    PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ArenaPlayer'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"arena_player__game_id__user_id" ON "ArenaPlayer" ("_gameId", "_userId");
CREATE INDEX IF NOT EXISTS"arena_player__arena_zone_id" ON "ArenaPlayer" ("_arenaZoneId");

CREATE TABLE IF NOT EXISTS "ItemRarity" ("id" TEXT, PRIMARY KEY ("id"));
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ItemRarity'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "Item" (
  "id" SERIAL,
  "name" TEXT UNIQUE,
  "emoji" TEXT,
  "usageLimit" INTEGER,
  "type" TEXT,
  "_itemRarityId" TEXT REFERENCES "ItemRarity" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "_organizationId" INTEGER REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'Item'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"item_name" ON "Item" ("name");
CREATE INDEX IF NOT EXISTS"item__item_rarity_id" ON "Item" ("_itemRarityId");

CREATE TABLE IF NOT EXISTS "ArenaItemInventory" (
  "id" SERIAL,
  "_arenaPlayerId" INTEGER REFERENCES "ArenaPlayer" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "_itemId" INTEGER REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "remainingUses" INTEGER,
  UNIQUE ("_arenaPlayerId", "_itemId"),
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ArenaItemInventory'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"arena_item_inventory__arena_player_id__item_id" ON "ArenaItemInventory" ("_arenaPlayerId", "_itemId");

CREATE TABLE IF NOT EXISTS "ArenaPlayerPerformance" (
  "_arenaPlayerId" INTEGER REFERENCES "ArenaPlayer" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "_gameId" INTEGER REFERENCES "Game" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "cheersReceived" INTEGER DEFAULT 0,
  "weaponsFound" INTEGER DEFAULT 0,
  "damageDealt" INTEGER DEFAULT 0,
  "cheersGiven" INTEGER DEFAULT 0,
  "healed" INTEGER DEFAULT 0,
  "kills" INTEGER DEFAULT 0,
  "firstBlood" BOOLEAN DEFAULT false,
  PRIMARY KEY ("_arenaPlayerId", "_gameId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ArenaPlayerPerformance'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "ArenaRound" (
  "id" SERIAL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "isEveryoneVisible" BOOLEAN DEFAULT false,
  "startedAt" TIMESTAMP WITH TIME ZONE,
  "endedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "_gameId" INTEGER REFERENCES "ArenaGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_createdById" INTEGER REFERENCES "User" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ArenaRound'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "AvailableAction" ("id" TEXT, PRIMARY KEY ("id"));
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'AvailableAction'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "ArenaRoundAction" (
  "_arenaPlayerId" INTEGER REFERENCES "ArenaPlayer" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "_arenaRoundId" INTEGER REFERENCES "ArenaRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "isCompleted" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "_availableActionId" TEXT REFERENCES "AvailableAction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "actionJSON" JSONB,
  PRIMARY KEY ("_arenaPlayerId", "_arenaRoundId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ArenaRoundAction'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "EnemyPattern" ("id" TEXT, PRIMARY KEY ("id"));
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'EnemyPattern'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "Enemy" (
  "id" SERIAL,
  "name" TEXT UNIQUE,
  "emoji" TEXT,
  "minorDamageRate" DOUBLE PRECISION,
  "majorDamageRate" DOUBLE PRECISION,
  "health" INTEGER,
  "isBoss" BOOLEAN DEFAULT false,
  "gifUrl" TEXT,
  "abilitiesJSON" JSONB DEFAULT '{"rarityRateBonus":0,"searchRate":0,"healthkitSearchRate":0,"armorSearchRate":0,"weaponSearchRate":0,"accuracy":0,"flatAttackBonus":0,"flatDefenseBonus":0,"attackRate":0,"defenseRate":0,"stunBlockRate":0,"stunOthersRate":0,"evadeRate":0,"initiative":1,"initiativeBonus":0,"flatHealingBoost":0}',
  "_enemyPatternId" TEXT REFERENCES "EnemyPattern" ("id") ON DELETE
  SET
    NULL ON UPDATE CASCADE,
    "_organizationId" INTEGER REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'Enemy'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"enemy_name" ON "Enemy" ("name");

CREATE TABLE IF NOT EXISTS "Trait" (
  "id" TEXT,
  "displayName" TEXT,
  "shortDescription" TEXT,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'Trait'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"trait_display_name" ON "Trait" ("displayName");

CREATE TABLE IF NOT EXISTS "EnemyTrait" (
  "_enemyId" INTEGER REFERENCES "Enemy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_traitId" TEXT REFERENCES "Trait" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("_enemyId", "_traitId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'EnemyTrait'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"enemy_trait__enemy_id__trait_id" ON "EnemyTrait" ("_enemyId", "_traitId");

CREATE TABLE IF NOT EXISTS "GameItemAvailability" (
  "_gameTypeId" TEXT REFERENCES "GameType" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_itemId" INTEGER REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "isActive" BOOLEAN DEFAULT TRUE,
  "isArchived" BOOLEAN DEFAULT false,
  PRIMARY KEY ("_gameTypeId", "_itemId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'GameItemAvailability'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"game_item_availability_is_archived" ON "GameItemAvailability" ("isArchived");
CREATE INDEX IF NOT EXISTS"game_item_availability_is_active" ON "GameItemAvailability" ("isActive");

CREATE TABLE IF NOT EXISTS "ItemArmor" (
  "_itemId" INTEGER REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "reductionRate" DOUBLE PRECISION,
  PRIMARY KEY ("_itemId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ItemArmor'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "ItemHealthKit" (
  "healingPower" INTEGER,
  "_itemId" INTEGER REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("_itemId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ItemHealthKit'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "ItemTrait" (
  "_itemId" INTEGER REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_traitId" TEXT REFERENCES "Trait" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE ("_itemId", "_traitId"),
  PRIMARY KEY ("_itemId", "_traitId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ItemTrait'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"item_trait__item_id__trait_id" ON "ItemTrait" ("_itemId", "_traitId");

CREATE TABLE IF NOT EXISTS "ItemWeapon" (
  "minorDamageRate" INTEGER,
  "majorDamageRate" INTEGER,
  "_itemId" INTEGER REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("_itemId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'ItemWeapon'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;

CREATE TABLE IF NOT EXISTS "Perk" (
  "id" TEXT,
  "archetype" TEXT NOT NULL,
  "name" TEXT,
  "emoji" TEXT,
  "description" TEXT,
  "abilitiesJSON" JSONB,
  "_itemRarityId" TEXT REFERENCES "ItemRarity" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "_organizationId" INTEGER REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'Perk'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"perk_name" ON "Perk" ("name");

CREATE TABLE IF NOT EXISTS "TowerGame" (
  "id" SERIAL,
  "lunaPrize" INTEGER,
  "height" INTEGER DEFAULT 10,
  "coinPrize" INTEGER,
  "isOpen" BOOLEAN DEFAULT false,
  "_gameId" INTEGER UNIQUE REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerGame'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"tower_game_is_open" ON "TowerGame" ("isOpen");

CREATE TABLE IF NOT EXISTS "TowerFloor" (
  "id" SERIAL,
  "number" INTEGER,
  "isEveryoneVisible" BOOLEAN DEFAULT false,
  "_towerGameId" INTEGER REFERENCES "TowerGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerFloor'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"tower_floor__tower_game_id" ON "TowerFloor" ("_towerGameId");

CREATE TABLE IF NOT EXISTS "TowerFloorBattlefield" (
  "id" SERIAL,
  "createdAt" TIMESTAMP WITH TIME ZONE,
  "_towerFloorId" INTEGER REFERENCES "TowerFloor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerFloorBattlefield'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"tower_floor_battlefield__tower_floor_id" ON "TowerFloorBattlefield" ("_towerFloorId");

CREATE TABLE IF NOT EXISTS "TowerRaider" (
  "id" SERIAL,
  "health" INTEGER,
  "isVisible" BOOLEAN DEFAULT TRUE,
  "luckBoost" DOUBLE PRECISION DEFAULT '0',
  "_userId" INTEGER REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_towerFloorBattlefieldId" INTEGER REFERENCES "TowerFloorBattlefield" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "abilitiesJSON" JSONB DEFAULT '{"rarityRateBonus":0,"searchRate":0,"healthkitSearchRate":0,"armorSearchRate":0,"weaponSearchRate":0,"accuracy":0,"flatAttackBonus":0,"flatDefenseBonus":0,"attackRate":0,"defenseRate":0,"stunBlockRate":0,"stunOthersRate":0,"evadeRate":0,"initiative":1,"initiativeBonus":0,"flatHealingBoost":0}',
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerRaider'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"tower_raider__tower_floor_battlefield_id__user_id" ON "TowerRaider" ("_towerFloorBattlefieldId", "_userId");
CREATE INDEX IF NOT EXISTS"tower_raider__tower_floor_battlefield_id" ON "TowerRaider" ("_towerFloorBattlefieldId");
CREATE INDEX IF NOT EXISTS"tower_raider__user_id" ON "TowerRaider" ("_userId");

CREATE TABLE IF NOT EXISTS "TowerFloorEnemy" (
  "id" SERIAL,
  "_enemyId" INTEGER REFERENCES "Enemy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_towerFloorId" INTEGER REFERENCES "TowerFloor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerFloorEnemy'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"tower_floor_enemy__tower_floor_id__enemy_id" ON "TowerFloorEnemy" ("_towerFloorId", "_enemyId");

CREATE TABLE IF NOT EXISTS "TowerFloorBattlefieldEnemy" (
  "id" SERIAL,
  "health" INTEGER,
  "isVisible" BOOLEAN DEFAULT TRUE,
  "patternCursor" INTEGER NOT NULL DEFAULT 0,
  "patternCounter" INTEGER NOT NULL DEFAULT 0,
  "abilitiesJSON" JSONB DEFAULT '{"rarityRateBonus":0,"searchRate":0,"healthkitSearchRate":0,"armorSearchRate":0,"weaponSearchRate":0,"accuracy":0,"flatAttackBonus":0,"flatDefenseBonus":0,"attackRate":0,"defenseRate":0,"stunBlockRate":0,"stunOthersRate":0,"evadeRate":0,"initiative":1,"initiativeBonus":0,"flatHealingBoost":0}',
  "_towerFloorEnemyId" INTEGER REFERENCES "TowerFloorEnemy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_towerFloorBattlefieldId" INTEGER REFERENCES "TowerFloorBattlefield" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerFloorBattlefieldEnemy'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"tower_floor_battlefield_enemy__tower_floor_battlefield_id__tower_floor_enemy_id" ON "TowerFloorBattlefieldEnemy" ("_towerFloorBattlefieldId", "_towerFloorEnemyId");
CREATE INDEX IF NOT EXISTS"tower_floor_battlefield_enemy_is_visible" ON "TowerFloorBattlefieldEnemy" ("isVisible");
CREATE INDEX IF NOT EXISTS"tower_floor_battlefield_enemy__tower_floor_battlefield_id" ON "TowerFloorBattlefieldEnemy" ("_towerFloorBattlefieldId");

CREATE TABLE IF NOT EXISTS "PerkInventory" (
  "id" SERIAL,
  "_perkId" TEXT REFERENCES "Perk" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_towerRaiderId" INTEGER REFERENCES "TowerRaider" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_towerFloorBattlefieldEnemyId" INTEGER REFERENCES "TowerFloorBattlefieldEnemy" ("id") ON DELETE
  SET
    NULL ON UPDATE CASCADE,
    "quantity" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE,
    UNIQUE ("_perkId", "_towerRaiderId"),
    UNIQUE ("_towerFloorBattlefieldEnemyId"),
    PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'PerkInventory'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"perk_inventory__perk_id" ON "PerkInventory" ("_perkId");
CREATE INDEX IF NOT EXISTS"perk_inventory__tower_raider_id" ON "PerkInventory" ("_towerRaiderId");
CREATE INDEX IF NOT EXISTS"perk_inventory__tower_floor_battlefield_enemy_id" ON "PerkInventory" ("_towerFloorBattlefieldEnemyId");
CREATE UNIQUE INDEX IF NOT EXISTS"perk_inventory__perk_id__tower_raider_id__tower_floor_battlefield_enemy_id" ON "PerkInventory" (
  "_perkId",
  "_towerRaiderId",
  "_towerFloorBattlefieldEnemyId"
);

CREATE TABLE IF NOT EXISTS "TeamGeneral" (
  "_teamId" INTEGER REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_userId" INTEGER REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE ("_teamId", "_userId"),
  PRIMARY KEY ("_teamId", "_userId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TeamGeneral'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"team_general__team_id__user_id" ON "TeamGeneral" ("_teamId", "_userId");

CREATE TABLE IF NOT EXISTS "TowerItemInventory" (
  "id" SERIAL,
  "_towerRaiderId" INTEGER REFERENCES "TowerRaider" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_itemId" INTEGER REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "remainingUses" INTEGER,
  UNIQUE ("_towerRaiderId", "_itemId"),
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerItemInventory'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"tower_item_inventory__tower_raider_id__item_id" ON "TowerItemInventory" ("_towerRaiderId", "_itemId");

CREATE TABLE IF NOT EXISTS "TowerRound" (
  "id" SERIAL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "isEveryoneVisible" BOOLEAN DEFAULT false,
  "startedAt" TIMESTAMP WITH TIME ZONE,
  "endedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "_towerFloorBattlefieldId" INTEGER REFERENCES "TowerFloorBattlefield" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_createdById" INTEGER REFERENCES "User" ("id") ON DELETE
  SET
    NULL ON UPDATE CASCADE,
    PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerRound'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"tower_round_is_active__tower_floor_battlefield_id" ON "TowerRound" ("isActive", "_towerFloorBattlefieldId");
CREATE INDEX IF NOT EXISTS"tower_round__tower_floor_battlefield_id" ON "TowerRound" ("_towerFloorBattlefieldId");

CREATE TABLE IF NOT EXISTS "TowerRoundAction" (
  "id" SERIAL,
  "_towerRaiderId" INTEGER REFERENCES "TowerRaider" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_towerFloorBattlefieldEnemyId" INTEGER REFERENCES "TowerFloorBattlefieldEnemy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_towerRoundId" INTEGER REFERENCES "TowerRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "isCompleted" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  "_availableActionId" TEXT REFERENCES "AvailableAction" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "actionJSON" JSONB,
  PRIMARY KEY ("id")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerRoundAction'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE INDEX IF NOT EXISTS"tower_round_action__tower_raider_id" ON "TowerRoundAction" ("_towerRaiderId");
CREATE INDEX IF NOT EXISTS"tower_round_action__tower_round_id" ON "TowerRoundAction" ("_towerRoundId");
CREATE INDEX IF NOT EXISTS"tower_round_action__tower_floor_battlefield_enemy_id" ON "TowerRoundAction" ("_towerFloorBattlefieldEnemyId");
CREATE UNIQUE INDEX IF NOT EXISTS"tower_round_action__tower_round_id__tower_raider_id__tower_floor_battlefield_enemy_id" ON "TowerRoundAction" (
  "_towerRoundId",
  "_towerRaiderId",
  "_towerFloorBattlefieldEnemyId"
);

CREATE TABLE IF NOT EXISTS "TowerStatistics" (
  "_userId" INTEGER REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "_towerGameId" INTEGER REFERENCES "TowerGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "attempts" INTEGER,
  "completed" INTEGER,
  "_gameId" INTEGER REFERENCES "TowerGame" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("_userId", "_towerGameId")
);
SELECT
  i.relname AS name,
  ix.indisprimary AS PRIMARY,
  ix.indisunique AS UNIQUE,
  ix.indkey AS indkey,
  array_agg(a.attnum) AS column_indexes,
  array_agg(a.attname) AS column_names,
  pg_get_indexdef(ix.indexrelid) AS definition
FROM
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND t.relkind = 'r'
  AND t.relname = 'TowerStatistics'
GROUP BY
  i.relname,
  ix.indexrelid,
  ix.indisprimary,
  ix.indisunique,
  ix.indkey
ORDER BY
  i.relname;
CREATE UNIQUE INDEX IF NOT EXISTS"tower_statistics__user_id__game_id" ON "TowerStatistics" ("_userId", "_gameId");