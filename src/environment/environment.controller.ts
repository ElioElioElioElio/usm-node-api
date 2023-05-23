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
import { EnvironmentService } from './environment.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { UniqueConstraintViolationException } from '@mikro-orm/core';

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
  findAll() {
    return this.environmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.environmentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ) {
    return this.environmentService.update(+id, updateEnvironmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.environmentService.remove(+id);
  }

  @Get(':id/nodes')
  findNodes(@Param('id') id: string) {
    return this.environmentService.findNodesByEnv(id);
  }
}
