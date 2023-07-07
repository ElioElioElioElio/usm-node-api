import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { EntityService } from '../shared/services/entity.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Group } from './entities/group.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { EnvironmentService } from '../environment/environment.service';
import { FilterQuery, FindOptions, Loaded, Reference } from '@mikro-orm/core';
import { Grpack } from '../grpack/entities/grpack.entity';
import { Node } from '../node/entities/node.entity';
import { BundleService } from '../bundle/bundle.service';
import { GrpackService } from '../grpack/services/grpack.service';

@Injectable()
export class NodeGroupService extends EntityService<Group> {
  constructor(
    @InjectRepository(Group) protected nodeGroupRepo: EntityRepository<Group>,
    protected readonly em: EntityManager,
    private readonly envService: EnvironmentService,
    private readonly bundleService: BundleService,
    private readonly grpackService: GrpackService,
  ) {
    super(nodeGroupRepo, em);
  }

  async create(environmentName: string, createGroupDto: CreateGroupDto) {
    const group = new Group();
    //Populate name
    group.name = createGroupDto.name;

    //Populate environment
    group.environment = await this.envService.findOneBy({
      name: environmentName,
    });

    //Populate grpacks included via mikroorm refs if exists
    if (!!createGroupDto.grpacks) {
      await Promise.all(
        createGroupDto.grpacks.map(async (grpackName) => {
          const grpack = await this.grpackService.findOne(grpackName);
          return grpack;
        }),
      ).then((grpacks) =>
        grpacks.forEach((element) => group.grpacks.add(element)),
      );
    }

    //Populate nodes included via mikroorm refs if exists
    if (!!createGroupDto.nodes) {
      createGroupDto.nodes
        .map((nodeName) => this.getRefNodeFromId(nodeName))
        .forEach((element) => {
          group.nodes.add(element);
        });
    }

    //Populate bundle if exists
    if (!!createGroupDto.bundle) {
      group.bundle = await this.bundleService.findOneBy({
        name: createGroupDto.bundle,
      });
    }

    //Persist creation
    await this.em.persistAndFlush(group);
    return group;
  }

  async update(
    groupName: string,
    updateGroupDto: UpdateGroupDto,
    environmentName?: string,
  ) {
    const group = await this.findOneBy({
      environment: environmentName,
      name: groupName,
    });

    if (!!environmentName) {
      if (group.environment.name === environmentName) {
        throw new NotFoundException(
          "Group '" +
            groupName +
            "' not found in the '" +
            environmentName +
            "' environment",
        );
      }
    }

    //Populate name if exists
    if (!!updateGroupDto.name) {
      group.name = updateGroupDto.name;
    }

    //Populate grpacks included via mikroorm refs if exists
    if (!!updateGroupDto.grpacks) {
      group.grpacks.removeAll();
      updateGroupDto.grpacks
        .map((grpackName) => this.getRefGrpackFromId(grpackName))
        .forEach((element) => {
          group.grpacks.add(element);
        });
    }

    //Populate nodes included via mikroorm refs if exists
    if (!!updateGroupDto.nodes) {
      group.nodes.removeAll();
      updateGroupDto.nodes
        .map((nodeName) => this.getRefNodeFromId(nodeName))
        .forEach((element) => {
          group.nodes.add(element);
        });
    }

    //Populate bundle if exists
    if (!!updateGroupDto.bundle) {
      group.bundle = await this.bundleService.findOneBy({
        name: updateGroupDto.bundle,
      });
    }

    //Persist update
    await this.em.persistAndFlush(group);
    return group;
  }

  async findOneBy(
    filterQuery: FilterQuery<Group>,
    findOptions?: FindOptions<Group, never>,
  ): Promise<Loaded<Group, never>> {
    const group = await this.repository.findOneOrFail(filterQuery, {
      populate: ['bundle', 'environment', 'grpacks', 'name', 'nodes'],
    });
    return group;
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
