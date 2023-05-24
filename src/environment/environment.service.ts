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

  create(dto: CreateEnvironmentDto) {
    const env = new Environment();
    env.name = dto.name;
    this.em.persistAndFlush(env);
  }

  update(id: string, dto: UpdateEnvironmentDto) {
    throw new Error('Method not implemented.');
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
  }

  findNodesByEnv(id: string) {
    throw new Error('Method not implemented.');
  }
}
