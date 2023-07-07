import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NodeService } from '../../node/node.service';
import { CreateNodeDto } from '../../node/dto/create-node.dto';
import { UpdateNodeDto } from '../../node/dto/update-node.dto';
import { EnvironmentService } from '../environment.service';

@ApiTags('nodes')
@Controller('environment/:idEnv')
export class NodeController {
  constructor(
    private readonly nodeService: NodeService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @Post('nodes/')
  create(
    @Param('idEnv') idEnv: string,
    @Body() createEnvironmentDto: CreateNodeDto,
  ) {
    return this.nodeService.create(idEnv, createEnvironmentDto);
  }

  @Get('nodes/')
  async findAll(@Param('idEnv') idEnv: string) {
    const env = await this.environmentService.findOneBy({ name: idEnv });
    return env.nodes;
  }

  @Get('nodes/:idNode')
  async findOne(
    @Param('idEnv') idEnv: string,
    @Param('idNode') idNode: string,
  ) {
    return await this.nodeService.findOneBy({
      name: idNode,
      environment: await this.environmentService.findOneBy({ name: idEnv }),
    });

    //return this.nodeService.findOneBy({ name: idNode });
  }

  @Patch('nodes/:idNode')
  async update(
    @Param('idEnv') idEnv: string,
    @Param('idNode') idNode: string,
    @Body() updateEnvironmentDto: UpdateNodeDto,
  ) {
    return await this.nodeService.update(idNode, updateEnvironmentDto);
  }

  @Delete('nodes/:idNode')
  remove(@Param('idEnv') idEnv: string, @Param('idNode') idNode: string) {
    return this.nodeService.removeBy({ name: idNode });
  }
}
