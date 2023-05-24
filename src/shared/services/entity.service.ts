import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Component, ComponentType } from '../entities/component.entity';
import { FilterQuery, FindOptions } from '@mikro-orm/core';

export abstract class EntityService<T extends Component> {
  readonly repository: EntityRepository<T>;
  readonly em: EntityManager;

  constructor(repository: EntityRepository<T>, em: EntityManager) {
    this.em = em;
    this.repository = repository;
  }

  findAll() {
    return this.repository.findAll({
      populate: true,
    });
  }

  findBy(filterQuery: FilterQuery<T>) {
    try {
      return this.repository.findOneOrFail(filterQuery, {
        populate: true,
      });
    } catch (err) {
      throw err;
    }
  }

  async removeBy(filterQuery: FilterQuery<T>) {
    try {
      const entity = await this.findBy(filterQuery);
      this.em.removeAndFlush(entity);
    } catch (err: unknown) {
      throw err;
    }
  }
}
