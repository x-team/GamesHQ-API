#!/usr/bin/env ts-node-script

import { Sequelize } from 'sequelize';
// tslint:disable-next-line: no-implicit-dependencies
import { Umzug, SequelizeStorage, MigrationMeta } from 'umzug';
import { sequelizeConfig } from './src/db';

const sequelize = new Sequelize({ ...sequelizeConfig, logging: undefined });

const storageTableName = {
  migration: { name: 'SequelizeMeta', path: './src/migrations/*.ts' },
  seeder: { name: 'SequelizeData', path: './src/seeders/*.ts' },
} as const;

const getUmzug = (type: keyof typeof storageTableName) => {
  return new Umzug({
    logger: console,
    migrations: {
      glob: storageTableName[type].path
    },
    context: { queryInterface: sequelize.getQueryInterface(), Sequelize },
    storage: new SequelizeStorage({
      sequelize,
      modelName: storageTableName[type].name,
    }),
  });
};

const execute = async (fn: () => Promise<MigrationMeta[]>, msg: string) => {
  fn()
    .then((result) => {
      console.log(
        msg,
        result.map((r) => r?.path ?? r)
      );
      process.exit();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
};

export const seedUp = () => execute(() => getUmzug('seeder').up(), 'Executed seeds:');
export const seedDown = () => execute(() => getUmzug('seeder').down(), 'Reverted seeds:');
export const migrateUp = () => execute(() => getUmzug('migration').up(), 'Executed migrations:');
export const migrateDown = () => execute(() => getUmzug('migration').down(), 'Reverted migration:');
