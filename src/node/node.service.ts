import { Injectable } from '@nestjs/common';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Node } from './entities/node.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { EnvironmentService } from '../environment/environment.service';
import { Reference } from '@mikro-orm/core';
import { Grpack } from '../grpack/entities/grpack.entity';
import { NodeGroup } from '../node-group/entities/node-group.entity';
import { NodeGroupService } from '../node-group/node-group.service';
import { GrpackBundleService } from '../grpack-bundle/grpack-bundle.service';

@Injectable()
export class NodeService {
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepository: EntityRepository<Node>,
    private readonly em: EntityManager,
    private readonly envService: EnvironmentService,
    private readonly nodeGroupService: NodeGroupService,
    private readonly grpackBundleService: GrpackBundleService,
  ) {}

  async create(createNodeDto: CreateNodeDto) {
    try {
      const node = new Node();

      //Populate name
      node.name = createNodeDto.name;

      //Populate environment
      node.environment = await this.envService.findOne(
        createNodeDto.environment,
      );

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
        node.nodeGroup = await this.nodeGroupService.findByName(
          createNodeDto.nodeGroup,
        );
      }

      //Populate grpackBundle  if exists
      if (!!createNodeDto.grpackBundle) {
        node.grpackBundle = await this.grpackBundleService.findOne(
          createNodeDto.grpackBundle,
        );
      }

      //Persist creation
      this.em.persistAndFlush(node);
    } catch (err: unknown) {
      throw err;
    }
  }

  findAll() {
    return this.nodeRepository.findAll();
  }

  async findOne(id: string) {
    return await this.nodeRepository.findOneOrFail({ name: id });
  }

  update(id: string, updateNodeDto: UpdateNodeDto) {
    return `This action updates a #${id} node`;
  }

  remove(id: string) {
    return `This action removes a #${id} node`;
  }

  private getRefGrpackFromId(grpackName: string): Reference<Grpack> {
    const repo = this.em.getRepository(Grpack);
    return repo.getReference(grpackName, { wrapped: true });
  }
}
