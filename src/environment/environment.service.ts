import { HttpException, Injectable } from '@nestjs/common';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Environment } from './entities/environment.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

@Injectable()
export class EnvironmentService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Environment)
    private readonly environmentRepository: EntityRepository<Environment>,
  ) {}

  async create(createEnvironmentDto: CreateEnvironmentDto) {
    try {
      const env = this.environmentRepository.create(createEnvironmentDto);
      await this.em.persistAndFlush(env);
      return env;
    } catch (error: unknown) {
      throw error;
    }
  }

  findAll() {
    return this.environmentRepository.findAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} environment`;
  }

  update(id: number, updateEnvironmentDto: UpdateEnvironmentDto) {
    return `This action updates a #${id} environment`;
  }

  remove(id: number) {
    return `This action removes a #${id} environment`;
  }

  async findNodesByEnv(envId: string) {
    //return 'Tiens voilà les nodes';
    return (await this.environmentRepository.findOne({ name: envId })).nodes;
  }
}
