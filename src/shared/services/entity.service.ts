import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Component } from '../entities/component.entity';
import { FilterQuery } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';

export abstract class EntityService<T extends Component> {
  readonly repository: EntityRepository<T>;
  readonly em: EntityManager;

  constructor(repository: EntityRepository<T>, em: EntityManager) {
    this.em = em;
    this.repository = repository;
  }

  async findAll() {
    return await this.repository.findAll({
      populate: true,
    });
  }

  async findOneBy(filterQuery: FilterQuery<T>) {
    return await this.repository.findOneOrFail(filterQuery, {
      populate: true,
    });
  }

  async findBy(filterQuery: FilterQuery<T>) {
    const res = await this.repository.find(filterQuery, {
      populate: true,
    });
    if (res.length == 0) {
      throw new NotFoundException();
    }
  }

  async removeBy(filterQuery: FilterQuery<T>) {
    const entity = await this.findOneBy(filterQuery);
    this.em.removeAndFlush(entity);
  }
}
