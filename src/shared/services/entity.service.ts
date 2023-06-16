import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Component } from '../entities/component.entity';
import { FilterQuery, FindOptions, Primary } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';

export abstract class EntityService<T extends Component> {
  protected readonly repository: EntityRepository<T>;
  protected readonly em: EntityManager;

  constructor(repository: EntityRepository<T>, em: EntityManager) {
    this.em = em;
    this.repository = repository;
  }

  async findAll(findOptions?: FindOptions<T>) {
    if (!!findOptions) {
      return await this.repository.findAll(findOptions);
    }

    return await this.repository.findAll();
  }

  async findOneBy(filterQuery: FilterQuery<T>, findOptions?: FindOptions<T>) {
    if (!!findOptions) {
      return await this.repository.findOneOrFail(filterQuery, findOptions);
    }
    return await this.repository.findOneOrFail(filterQuery);
  }

  async findBy(filterQuery: FilterQuery<T>, findOptions?: FindOptions<T>) {
    if (!!findOptions) {
      const res = await this.repository.find(filterQuery, findOptions);
      if (res.length == 0) {
        throw new NotFoundException();
      }
      return res;
    }
    const res = await this.repository.find(filterQuery);
    if (res.length == 0) {
      throw new NotFoundException();
    }
    return res;
  }

  async removeBy(filterQuery: FilterQuery<T>) {
    const entity = await this.findOneBy(filterQuery);
    await this.em.removeAndFlush(entity);
  }

  async getRef(id: Primary<T>) {
    this.repository.getReference(id);
  }
}
