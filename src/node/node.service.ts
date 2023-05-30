import { Injectable } from '@nestjs/common';
import { UpdateNodeDto } from './dto/update-node.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Node } from './entities/node.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { EnvironmentService } from '../environment/environment.service';
import { FilterQuery, Reference } from '@mikro-orm/core';
import { Grpack } from '../grpack/entities/grpack.entity';
import { NodeGroup } from '../node-group/entities/node-group.entity';
import { NodeGroupService } from '../node-group/node-group.service';
import { GrpackBundleService } from '../grpack-bundle/grpack-bundle.service';
import { EntityService } from '../shared/services/entity.service';
import { CreateNodeDto } from './dto/create-node.dto';

@Injectable()
export class NodeService extends EntityService<Node> {
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepository: EntityRepository<Node>,
    readonly em: EntityManager,
    private readonly envService: EnvironmentService,
    private readonly nodeGroupService: NodeGroupService,
    private readonly grpackBundleService: GrpackBundleService,
  ) {
    super(nodeRepository, em);
  }

  async create(environmentName: string, createNodeDto: CreateNodeDto) {
    const node = new Node();

    //Populate name
    node.name = createNodeDto.name;

    //Populate environment
    node.environment = await this.envService.findOneBy({
      name: environmentName,
    });

    //Populate grpacks included via mikroorm refs if exists
    if (!!createNodeDto.grpacks) {
      createNodeDto.grpacks
        .map((grpackName) => this.getRefGrpackFromId(grpackName))
        .forEach((element) => {
          node.grpacks.add(element);
        });
    }
    //Populate nodeGroup if exists
    if (!!createNodeDto.nodeGroup) {
      node.nodeGroup = await this.nodeGroupService.findOneBy({
        name: createNodeDto.nodeGroup,
      });
    }

    //Populate grpackBundle if exists
    if (!!createNodeDto.grpackBundle) {
      node.grpackBundle = await this.grpackBundleService.findOne(
        createNodeDto.grpackBundle,
      );
    }

    //Persist creation
    this.em.persistAndFlush(node);
  }

  async update(id: string, updateNodeDto: UpdateNodeDto) {
    const node = await this.findOneBy({ name: id });

    //Populate name if exists
    if (!!this.update.name) {
      node.name = updateNodeDto.name;
    }

    //Populate grpacks included via mikroorm refs if exists
    if (!!updateNodeDto.grpacks) {
      updateNodeDto.grpacks
        .map((grpackName) => this.getRefGrpackFromId(grpackName))
        .forEach((element) => {
          node.grpacks.add(element);
        });
    }

    //Populate nodeGroup if exists
    if (!!updateNodeDto.nodeGroup) {
      node.nodeGroup = await this.nodeGroupService.findOneBy({
        name: updateNodeDto.nodeGroup,
      });
    }

    //Populate grpackBundle if exists
    if (!!updateNodeDto.grpackBundle) {
      node.grpackBundle = await this.grpackBundleService.findOne(
        updateNodeDto.grpackBundle,
      );
    }

    //Persist creation
    this.em.persistAndFlush(node);
  }

  private getRefGrpackFromId(grpackName: string): Reference<Grpack> {
    const repo = this.em.getRepository(Grpack);
    return repo.getReference(grpackName, { wrapped: true });
  }
}
