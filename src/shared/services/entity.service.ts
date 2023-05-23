import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Component, ComponentType } from '../entities/component.entity';

export abstract class EntityService<T extends Component> {
  readonly repository: EntityRepository<T>;
  readonly em: EntityManager;

  constructor(repository: EntityRepository<T>, em: EntityManager) {
    this.em = em;
    this.repository = repository;
  }

  findAll() {
    return this.repository.findAll();
  }

  async findByName(whereClause: any) {
    const truc = this.repository.findAll();
    return this.repository.findOneOrFail(whereClause);
  }

  async removeByName(name: any) {
    try {
      const entity = await this.findByName(name);
      this.em.removeAndFlush(entity);
    } catch (err: unknown) {
      throw err;
    }
  }
}
