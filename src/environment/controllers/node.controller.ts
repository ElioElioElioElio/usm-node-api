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
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { ApiTags } from '@nestjs/swagger';
import { UpdateEnvironmentDto } from '../dto/environments/update-environment.dto';
import { NodeService } from '../../node/node.service';
import { CreateNodeDto } from '../../node/dto/create-node.dto';
import { UpdateNodeDto } from '../../node/dto/update-node.dto';

@ApiTags('nodes')
@Controller('environment')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Post(':idEnv/nodes/')
  create(
    @Param('idEnv') idEnv: string,
    @Body() createEnvironmentDto: CreateNodeDto,
  ) {
    try {
      return this.nodeService.create(idEnv, createEnvironmentDto);
    } catch (err: unknown) {
      if (err instanceof UniqueConstraintViolationException) {
        throw new HttpException(
          'environment name already existing',
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  @Get(':idEnv/nodes/')
  async findAll(@Param('idEnv') idEnv: string) {
    return await this.nodeService.findBy({ environment: idEnv });
  }

  @Get(':idEnv/nodes/:idNode')
  findOne(@Param('id') id: string) {
    return this.nodeService.findBy({ name: id });
  }

  @Patch(':idEnv/nodes/:idNode')
  update(
    @Param('idNode') idNode: string,
    @Body() updateEnvironmentDto: UpdateNodeDto,
  ) {
    return this.nodeService.update(idNode, updateEnvironmentDto);
  }

  @Delete(':idEnv/nodes/:idNode')
  remove(@Param('id') id: string) {
    return this.nodeService.removeBy({ name: id });
  }
}
