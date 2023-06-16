import { EntityManager, EntityRepository } from '@mikro-orm/core';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { CreatePackageDto } from '../dto/packages/create-package.dto';
import { UpdatePackageDto } from '../dto/packages/update-package.dto';
import { Package } from '../entities/package.entity';
import { OsService } from './os.service';
import { GrpackService } from './grpack.service';

@Injectable()
export class PackagesService {
  constructor(
    private readonly em: EntityManager,
    private readonly grpackService: GrpackService,
    private readonly osService: OsService,
    @InjectRepository(Package)
    private readonly packageRepository: EntityRepository<Package>,
  ) {}

  async create(grpackName: string, createPackageDto: CreatePackageDto) {
    const grpack = await this.grpackService.findOne(grpackName);
    const os = await this.osService.findOne(createPackageDto.os);

    const tmp = await this.packageRepository.findOne({
      os: os,
      grpack: grpack,
    });

    if (!!tmp) {
      throw new ConflictException(
        "Package for the os '" +
          os.osName +
          "' already existing for the Grpack named '" +
          grpack.name +
          "'",
      );
    }

    const pkg = this.packageRepository.create({
      os: os,
      packageName: createPackageDto.packageName,
      version: createPackageDto.version,
      grpack: grpack,
    });
    await this.em.persistAndFlush(pkg);
    return pkg;
  }

  async findAll(grpackName: string) {
    const grpack = await this.grpackService.findOne(grpackName);
    return grpack.package;
  }

  async findOne(grpackName: string, osName: string) {
    const grpack = await this.grpackService.findOne(grpackName);
    const os = await this.osService.findOne(osName);
    const pkg = await this.packageRepository.findOneOrFail({
      os: os,
      grpack: grpack,
    });
    return pkg;
  }

  async update(
    grpackName: string,
    osName: string,
    updatePackageDto: UpdatePackageDto,
  ) {
    const grpack = await this.grpackService.findOne(grpackName);
    const os = await this.osService.findOne(osName);
    const pkg = await this.packageRepository.findOne({
      os: os,
      grpack: grpack,
    });

    if (!!updatePackageDto.os) {
      const osUpdate = await this.osService.findOne(updatePackageDto.os);
      if (!!osUpdate) {
        pkg.os = osUpdate;
      } else {
        throw new BadRequestException(
          "Os '" + updatePackageDto.os + "' not found",
        );
      }
    }

    if (!!updatePackageDto.packageName) {
      pkg.packageName = updatePackageDto.packageName;
    }

    if (!!updatePackageDto.version) {
      pkg.version = updatePackageDto.version;
    }

    this.em.persistAndFlush(pkg);

    const pkgPopulated = await this.em.populate(pkg, true);

    return pkgPopulated[0];
  }

  async remove(grpackName: string, osName: string) {
    const pkg = await this.findOne(grpackName, osName);
    await this.em.removeAndFlush(pkg);
  }

  private async checkIfOsExist(osNameToCheck) {
    const osName = await this.osService.findAll();
    osName.forEach((os) => {
      if (os.osName === osNameToCheck) {
        return true;
      }
    });
    return false;
  }
}
