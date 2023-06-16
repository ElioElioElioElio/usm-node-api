import { Injectable } from '@nestjs/common';
import { Os } from '../entities/os.entity';
import { CreateOsDto } from '../dto/os/create-os.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { UpdateOsDto } from '../dto/os/update-os.dto';

@Injectable()
export class OsService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Os)
    private readonly osRepository: EntityRepository<Os>,
  ) {}

  async create(createOsDto: CreateOsDto) {
    const os = this.osRepository.create(createOsDto);
    await this.em.persistAndFlush(os);
    return await this.findOne(os.osName);
  }

  async findAll() {
    return this.osRepository.findAll();
  }

  async findOne(osName: string) {
    return await this.osRepository.findOneOrFail({
      osName: osName,
    });
  }

  async update(id: string, updateOsDto: UpdateOsDto) {
    const os = await this.findOne(id);

    if (!!updateOsDto.osName) {
      os.osName = updateOsDto.osName;
      this.em.persistAndFlush(os);
    }
    return os;
  }

  async remove(id: string) {
    const os = await this.findOne(id);
    await this.em.removeAndFlush(os);
  }
}
