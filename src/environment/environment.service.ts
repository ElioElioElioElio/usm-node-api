import { Injectable } from '@nestjs/common';
import { CreateEnvironmentDto } from './dto/environments/create-environment.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Environment } from './entities/environment.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { EntityService } from '../shared/services/entity.service';
import { UpdateEnvironmentDto } from './dto/environments/update-environment.dto';
import { FilterQuery, FindOptions, Loaded } from '@mikro-orm/core';

@Injectable()
export class EnvironmentService extends EntityService<Environment> {
  constructor(
    @InjectRepository(Environment)
    envRepo: EntityRepository<Environment>,
    em: EntityManager,
  ) {
    super(envRepo, em);
  }

  async create(dto: CreateEnvironmentDto) {
    const env = new Environment();
    env.name = dto.name;
    await this.em.persistAndFlush(env);
    return env;
  }

  async update(id: string, dto: UpdateEnvironmentDto) {
    const env = await this.findOneBy({ name: id });
    if (!!dto.name) {
      env.name = dto.name;
      await this.em.persistAndFlush(env);
    }
    return env;
  }

  async findAll() {
    const envs = await this.repository.findAll({
      populate: [
        'bundles',
        'bundles.bundle',
        'bundles.grpacks',
        'bundles.grpacks.package',
        'bundles.grpacks.package.os',
        'nodes',
        'nodes.bundle',
        'nodes.grpacks',
        'groups',
        'groups.nodes',
        'groups.bundle',
        'groups.grpacks',
      ],
    });
    envs.forEach(async (env) => {
      await env.nodes.loadItems();
      env.nodes.set(env.nodes.getItems().filter((node) => node.group === null));
    });
    return envs;
  }

  async findOneBy(
    filterQuery: FilterQuery<Environment>,
  ): Promise<Loaded<Environment, never>> {
    const env = await this.repository.findOneOrFail(filterQuery, {
      populate: [
        'bundles',
        'bundles.bundle',
        'bundles.grpacks',
        'bundles.grpacks.package',
        'bundles.grpacks.package.os',
        'nodes',
        'nodes.bundle',
        'nodes.grpacks',
        'groups',
        'groups.nodes',
      ],
    });

    await env.nodes.loadItems();
    env.nodes.set(env.nodes.getItems().filter((node) => node.group === null));

    return env;
  }
}
