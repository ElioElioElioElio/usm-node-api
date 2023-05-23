import { Injectable } from '@nestjs/common';
import { CreateNodeGroupDto } from './dto/create-node-group.dto';
import { UpdateNodeGroupDto } from './dto/update-node-group.dto';
import { EntityService } from '../shared/services/entity.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NodeGroup } from './entities/node-group.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class NodeGroupService extends EntityService<NodeGroup> {
  constructor(
    @InjectRepository(NodeGroup) nodeGroupRepo: EntityRepository<NodeGroup>,
    em: EntityManager,
  ) {
    super(nodeGroupRepo, em);
  }

  create(createNodeGroupDto: CreateNodeGroupDto): string {
    this.findAll();

    return 'This action adds a new nodeGroup';
  }

  update(id: string, updateNodeGroupDto: UpdateNodeGroupDto) {
    return `This action updates a #${id} nodeGroup`;
  }
}
