import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { UpdateNodeDto } from './dto/update-node.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Node } from './entities/node.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { EnvironmentService } from '../environment/environment.service';
import { Reference } from '@mikro-orm/core';
import { Grpack } from '../grpack/entities/grpack.entity';
import { NodeGroupService } from '../group/group.service';
import { BundleService } from '../bundle/bundle.service';
import { EntityService } from '../shared/services/entity.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { GrpackService } from '../grpack/services/grpack.service';

@Injectable()
export class NodeService extends EntityService<Node> {
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepository: EntityRepository<Node>,
    readonly em: EntityManager,
    private readonly envService: EnvironmentService,
    @Inject(forwardRef(() => NodeGroupService))
    private readonly nodeGroupService: NodeGroupService,
    private readonly bundleService: BundleService,
    private readonly grpackService: GrpackService,
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
      await Promise.all(
        createNodeDto.grpacks.map(async (grpackName) => {
          const grpack = await this.grpackService.findOne(grpackName);
          return grpack;
        }),
      ).then((grpacks) =>
        grpacks.forEach((element) => node.grpacks.add(element)),
      );
    }
    //Populate nodeGroup if exists
    if (!!createNodeDto.group) {
      node.group = await this.nodeGroupService.findOneBy(
        {
          name: createNodeDto.group,
        },
        { populate: true },
      );
    }

    //Populate bundle if exists
    if (!!createNodeDto.bundle) {
      node.bundle = await this.bundleService.findOneBy(
        {
          name: createNodeDto.bundle,
        },
        { populate: true },
      );
    }

    //Persist creation
    await this.em.persistAndFlush(node);

    return node;
  }

  async update(
    nodeName: string,
    updateNodeDto: UpdateNodeDto,
    environmentName?: string,
  ) {
    const node = await this.findOneBy({ name: nodeName }, { populate: true });

    if (!!node) {
      if (node.environment.name === environmentName) {
        throw new NotFoundException(
          "Node '" +
            nodeName +
            "' not found in the '" +
            environmentName +
            "' environment",
        );
      }
    }

    //Populate name if exists
    if (!!updateNodeDto.name) {
      node.name = updateNodeDto.name;
    }

    //Populate grpacks included via mikroorm refs if exists
    if (!!updateNodeDto.grpacks) {
      node.grpacks.removeAll();
      await Promise.all(
        updateNodeDto.grpacks.map(async (grpackName) => {
          const grpack = await this.grpackService.findOne(grpackName);
          return grpack;
        }),
      ).then((grpacks) =>
        grpacks.forEach((element) => node.grpacks.add(element)),
      );
    }

    //Populate nodeGroup if exists
    if (updateNodeDto.group !== undefined) {
      if (updateNodeDto.group !== null) {
        node.group = await this.nodeGroupService.findOneBy({
          name: updateNodeDto.group,
        });
      } else {
        node.group = null;
      }
    }

    //Populate bundle if exists
    if (updateNodeDto.bundle !== undefined) {
      if (updateNodeDto.bundle !== null) {
        node.bundle = await this.bundleService.findOneBy(
          {
            name: updateNodeDto.bundle,
          },
          {},
        );
      } else {
        node.bundle = null;
      }
    }

    //Persist update
    await this.em.persistAndFlush(node);

    return node;
  }

  private getRefGrpackFromId(grpackName: string): Reference<Grpack> {
    const repo = this.em.getRepository(Grpack);
    return repo.getReference(grpackName, { wrapped: true });
  }
}
