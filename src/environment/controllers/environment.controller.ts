import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EnvironmentService } from '../environment.service';
import { CreateEnvironmentDto } from '../dto/environments/create-environment.dto';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ApiTags } from '@nestjs/swagger';
import { UpdateEnvironmentDto } from '../dto/environments/update-environment.dto';

@ApiTags('environment')
@Controller('environment')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Post()
  create(@Body() createEnvironmentDto: CreateEnvironmentDto) {
    try {
      return this.environmentService.create(createEnvironmentDto);
    } catch (err: unknown) {
      if (err instanceof UniqueConstraintViolationException) {
        throw new HttpException(
          'environment name already existing',
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  @Get()
  async findAll() {
    return await this.environmentService.findAll();
  }

  @Get(':idEnv')
  findOne(@Param('id') id: string) {
    return this.environmentService.findBy({ name: id });
  }

  @Patch(':idEnv')
  update(
    @Param('id') id: string,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ) {
    return this.environmentService.update(id, updateEnvironmentDto);
  }

  @Delete(':idEnv')
  remove(@Param('id') id: string) {
    return this.environmentService.removeBy({ name: id });
  }
}
