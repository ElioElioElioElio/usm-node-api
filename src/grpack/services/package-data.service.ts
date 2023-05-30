import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { PackageData } from '../entities/package-data.entity';
import { CreatePackageDataDto } from '../dto/packageDataDto/create-package-data.dto';
import { validate } from 'class-validator';

@Injectable()
export class PackageDataService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(PackageData)
    private readonly packageDataRepository: EntityRepository<PackageData>,
  ) {}

  async create(createPackageDataDto: CreatePackageDataDto) {
    const pckgData = this.packageDataRepository.create(createPackageDataDto);
    await this.em.persistAndFlush(pckgData);
    return pckgData;
  }

  findAll() {
    return this.packageDataRepository.findAll();
  }

  findOne(packageName: string, version: string) {
    return this.packageDataRepository.findOneOrFail({
      packageName: packageName,
      version: version,
    });
  }
}
