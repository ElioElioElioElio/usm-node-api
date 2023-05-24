import { Injectable } from '@nestjs/common';
import { CreateGrpackBundleDto } from './dto/create-grpack-bundle.dto';
import { UpdateGrpackBundleDto } from './dto/update-grpack-bundle.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { GrpackBundle } from './entities/grpack-bundle.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Grpack } from '../grpack/entities/grpack.entity';
import { Reference } from '@mikro-orm/core';
import { EnvironmentService } from '../environment/environment.service';

@Injectable()
export class GrpackBundleService {
  constructor(
    @InjectRepository(GrpackBundle)
    private readonly grpackBundleRepository: EntityRepository<GrpackBundle>,
    private readonly em: EntityManager,
    private readonly envService: EnvironmentService,
  ) {}

  async create(createGrpackBundleDto: CreateGrpackBundleDto) {
    try {
      const grpackBundle = new GrpackBundle();
      grpackBundle.name = createGrpackBundleDto.name;
      grpackBundle.environment = await this.envService.findBy({
        name: createGrpackBundleDto.environment,
      });

      //Populate grpacks of the bundle with reference of grpack
      if (!!createGrpackBundleDto.grpacks) {
        createGrpackBundleDto.grpacks
          .map((grpackName) => this.getRefGrpackFromId(grpackName))
          .forEach((element) => {
            grpackBundle.grpacks.add(element);
          });
      }

      if (!!createGrpackBundleDto.grpackBundle) {
        grpackBundle.grpackBundled =
          await this.grpackBundleRepository.findOneOrFail({
            name: createGrpackBundleDto.grpackBundle,
          });
      }

      this.em.persistAndFlush(grpackBundle);

      //
    } catch (err: unknown) {
      throw err;
    }

    return 'This action adds a new grpackBundle';
  }

  findAll() {
    return this.grpackBundleRepository.findAll();
  }

  findOne(id: string) {
    return this.grpackBundleRepository.findOneOrFail({ name: id });
  }

  update(id: string, updateGrpackBundleDto: UpdateGrpackBundleDto) {
    return `This action updates a #${id} grpackBundle`;
  }

  remove(id: string) {
    return `This action removes a #${id} grpackBundle`;
  }

  private getRefGrpackFromId(grpackName: string): Reference<Grpack> {
    const repo = this.em.getRepository(Grpack);
    return repo.getReference(grpackName, { wrapped: true });
  }
}
