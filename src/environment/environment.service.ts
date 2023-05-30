import { Injectable } from '@nestjs/common';
import { CreateEnvironmentDto } from './dto/environments/create-environment.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Environment } from './entities/environment.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { EntityService } from '../shared/services/entity.service';
import { UpdateEnvironmentDto } from './dto/environments/update-environment.dto';

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
  }

  async update(id: string, dto: UpdateEnvironmentDto) {
    const env = await this.findOneBy({ name: id });
    env.name = dto.name;
    await this.em.persistAndFlush(env);
  }

  findAll() {
    return this.repository.findAll({
      populate: [
        'nodes',
        'nodeGroups',
        'nodeGroups.nodes',
        'nodeGroups.grpacks',
        'grpackBundle',
        'grpackBundle.grpackBundled',
        'grpackBundle.grpacks',
        'nodes.grpacks',
      ],
    });
    this.repository.find;
  }
}
