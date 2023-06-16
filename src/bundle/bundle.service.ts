import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBundleDto } from './dto/rename-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Bundle } from './entities/bundle.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Grpack } from '../grpack/entities/grpack.entity';
import {
  FilterQuery,
  FindOptions,
  Loaded,
  Reference,
  wrap,
} from '@mikro-orm/core';
import { EnvironmentService } from '../environment/environment.service';
import { EntityService } from '../shared/services/entity.service';

@Injectable()
export class BundleService extends EntityService<Bundle> {
  constructor(
    @InjectRepository(Bundle)
    protected readonly bundleRepository: EntityRepository<Bundle>,
    protected readonly em: EntityManager,
    private readonly envService: EnvironmentService,
  ) {
    super(bundleRepository, em);
  }

  async create(environment: string, createBundleDto: CreateBundleDto) {
    const bundle = new Bundle();

    bundle.name = createBundleDto.name;

    bundle.environment = await this.envService.findOneBy({
      name: environment,
    });

    //Populate grpacks of the bundle with reference of grpack
    if (!!createBundleDto.grpacks) {
      createBundleDto.grpacks
        .map((grpackName) => this.getRefGrpackFromId(grpackName))
        .forEach((element) => {
          bundle.grpacks.add(element);
        });
    }

    if (!!createBundleDto.bundle) {
      bundle.bundle = await this.bundleRepository.findOneOrFail({
        name: createBundleDto.bundle,
      });
    }

    await this.em.persistAndFlush(bundle);

    //await bundle.grpacks.init();

    return bundle;

    const bundlePopulated = await this.em.populate(bundle, true);

    return bundlePopulated[0];
  }

  async update(
    bundleName: string,
    updateBundleDto: UpdateBundleDto,
    environmentName?: string,
  ) {
    const bundle = await this.findOneBy(
      { name: bundleName },
      { populate: true },
    );

    if (!!environmentName) {
      if (bundle.environment.name === environmentName) {
        throw new NotFoundException(
          "Bundle '" +
            bundle +
            "' not found in the '" +
            environmentName +
            "' environment",
        );
      }
    }

    //Populate name if exists
    if (!!updateBundleDto.name) {
      bundle.name = updateBundleDto.name;
    }

    //Populate grpacks of the bundle with reference of grpack
    if (!!updateBundleDto.grpacks) {
      updateBundleDto.grpacks
        .map((grpackName) => this.getRefGrpackFromId(grpackName))
        .forEach((element) => {
          bundle.grpacks.add(element);
        });
    }

    if (!!updateBundleDto.bundle) {
      bundle.bundle = await this.bundleRepository.findOneOrFail({
        name: updateBundleDto.bundle,
      });
    }

    this.em.persistAndFlush(bundle);

    return bundle;
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findOneBy(
    filterQuery: FilterQuery<Bundle>,
    findOptions?: FindOptions<Bundle, never>,
  ): Promise<Loaded<Bundle, never>> {
    const bundle = await this.repository.findOneOrFail(filterQuery);

    return bundle;
  }

  private getRefGrpackFromId(grpackName: string): Reference<Grpack> {
    const repo = this.em.getRepository(Grpack);
    return repo.getReference(grpackName, { wrapped: true });
  }
}
