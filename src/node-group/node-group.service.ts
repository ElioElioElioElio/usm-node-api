import { Injectable } from '@nestjs/common';
import { CreateNodeGroupDto } from './dto/create-node-group.dto';
import { UpdateNodeGroupDto } from './dto/update-node-group.dto';
import { EntityService } from '../shared/services/entity.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NodeGroup } from './entities/node-group.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { EnvironmentService } from '../environment/environment.service';
import { FilterQuery, Reference } from '@mikro-orm/core';
import { Grpack } from '../grpack/entities/grpack.entity';
import { Node } from '../node/entities/node.entity';
import { GrpackBundleService } from '../grpack-bundle/grpack-bundle.service';

@Injectable()
export class NodeGroupService extends EntityService<NodeGroup> {
  constructor(
    @InjectRepository(NodeGroup) nodeGroupRepo: EntityRepository<NodeGroup>,
    em: EntityManager,
    private readonly envService: EnvironmentService,
    private readonly grpackBundleService: GrpackBundleService,
  ) {
    super(nodeGroupRepo, em);
  }

  async create(createNodeGroupDto: CreateNodeGroupDto) {
    try {
      const nodeGrp = new NodeGroup();
      //Populate name
      nodeGrp.name = createNodeGroupDto.name;

      //Populate environment
      nodeGrp.environment = await this.envService.findBy({
        name: createNodeGroupDto.environment,
      });

      //Populate grpacks included via mikroorm refs if exists
      if (!!createNodeGroupDto.grpacks) {
        createNodeGroupDto.grpacks
          .map((grpackName) => this.getRefGrpackFromId(grpackName))
          .forEach((element) => {
            nodeGrp.grpacks.add(element);
          });
      }

      //Populate nodes included via mikroorm refs if exists
      if (!!createNodeGroupDto.nodes) {
        createNodeGroupDto.nodes
          .map((nodeName) => this.getRefNodeFromId(nodeName))
          .forEach((element) => {
            nodeGrp.nodes.add(element);
          });
      }

      //Populate grpackBundle if exists
      if (!!createNodeGroupDto.grpackBundle) {
        nodeGrp.grpackBundle = await this.grpackBundleService.findOne(
          createNodeGroupDto.grpackBundle,
        );
      }

      //Persist creation
      this.em.persistAndFlush(nodeGrp);
    } catch (err) {
      throw err;
    }
  }

  update(id: string, updateNodeGroupDto: UpdateNodeGroupDto) {
    return `This action updates a #${id} nodeGroup`;
  }

  private getRefGrpackFromId(grpackName: string): Reference<Grpack> {
    const repo = this.em.getRepository(Grpack);
    return repo.getReference(grpackName, { wrapped: true });
  }

  private getRefNodeFromId(nodeName: string): Reference<Node> {
    const repo = this.em.getRepository(Node);
    return repo.getReference(nodeName, { wrapped: true });
  }
}
