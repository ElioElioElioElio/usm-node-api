import { Injectable } from '@nestjs/common';
import { UpdateGrpackDto } from '../dto/grpack/update-grpack.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Grpack } from '../entities/grpack.entity';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { CreateGrpackDto } from '../dto/grpack/create-grpack.dto';
import { OsService } from './os.service';

@Injectable()
export class GrpackService {
  constructor(
    @InjectRepository(Grpack)
    private readonly grpackRepository: EntityRepository<Grpack>,
    private readonly em: EntityManager,
  ) {}

  async create(createGrpackDto: CreateGrpackDto) {
    const grpack = this.grpackRepository.create(createGrpackDto);
    await this.em.persistAndFlush(grpack);
    return grpack;
  }

  findAll() {
    return this.grpackRepository.findAll({
      populate: true,
    });
  }

  findOne(id: string) {
    return this.grpackRepository.findOneOrFail(
      { name: id },
      { populate: true },
    );
  }

  async update(id: string, updateGrpackDto: UpdateGrpackDto) {
    const grpack = await this.findOne(id);

    if (!!updateGrpackDto.name) {
      grpack.name = updateGrpackDto.name;
      this.em.persistAndFlush(grpack);
    }
    return grpack;
  }

  async remove(id: string) {
    const grpack = await this.em.findOneOrFail(Grpack, { name: id });
    this.em.removeAndFlush(grpack);
  }
}
