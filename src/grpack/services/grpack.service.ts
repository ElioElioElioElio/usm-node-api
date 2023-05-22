import { Injectable } from '@nestjs/common';
import { UpdateGrpackDto } from '../dto/grpack/update-grpack.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Grpack } from '../entities/grpack.entity';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { CreateGrpackDto } from '../dto/grpack/create-grpack.dto';
import { CreatePackageDto } from '../dto/package/create-package.dto';
import { Package } from '../entities/package.entity';
import { OsService } from './os.service';
import { PackageDataService } from './package-data.service';

@Injectable()
export class GrpackService {
  constructor(
    @InjectRepository(Grpack)
    private readonly grpackRepository: EntityRepository<Grpack>,
    private readonly osService: OsService,
    private readonly packageDataService: PackageDataService,
    private readonly em: EntityManager,
  ) {}

  async create(createGrpackDto: CreateGrpackDto) {
    try {
      const grpack = this.grpackRepository.create(createGrpackDto);
      await this.em.persistAndFlush(grpack);
      return grpack;
    } catch (error: unknown) {
      throw error;
    }
  }

  findAll() {
    return this.grpackRepository.findAll({ populate: ['package'] });
  }

  findOne(id: number) {
    return `This action returns a #${id} grpack`;
  }

  update(id: number, updateGrpackDto: UpdateGrpackDto) {
    return `This action updates a #${id} grpack`;
  }

  remove(id: number) {
    return `This action removes a #${id} grpack`;
  }

  async addPackage(id: string, createPackageDto: CreatePackageDto) {
    const grpack = await this.grpackRepository.findOneOrFail({ name: id });
    const pckg = new Package();
    pckg.grpack = grpack;

    const os = await this.osService.findOne(
      createPackageDto.os.osName,
      createPackageDto.os.version,
    );
    pckg.os = os;

    const packageData = await this.packageDataService.findOne(
      createPackageDto.packageData.packageName,
      createPackageDto.packageData.version,
    );
    pckg.packageData = packageData;

    grpack.package.add(pckg);
    this.em.persistAndFlush(grpack);

    //grpack.package.
  }
}
