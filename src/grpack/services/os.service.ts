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
    try {
      const os = this.osRepository.create(createOsDto);
      await this.em.persistAndFlush(os);
      return os;
    } catch (err: unknown) {
      throw err;
    }
  }

  async findAll() {
    return this.osRepository.findAll();
  }

  findOne(osName: string, version: string) {
    return this.osRepository.findOneOrFail({
      osName: osName,
      version: version,
    });
  }

  update(id: string, updateGrpackDto: UpdateOsDto) {
    return `This action updates a #${id} os`;
  }

  remove(id: string) {
    return `This action removes a #${id} os`;
  }
}
