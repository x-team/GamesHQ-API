import type { Model } from 'sequelize-typescript';

export const arrayToJSON = <T extends Model>(entities: Array<T>) => {
  return entities.map((entity) => entity.toJSON());
};
