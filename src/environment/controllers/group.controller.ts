import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateGroupDto } from '../../group/dto/create-group.dto';
import { NodeGroupService } from '../../group/group.service';
import { EnvironmentService } from '../environment.service';
import { UpdateNodeDto } from '../../node/dto/update-node.dto';

@ApiTags('groups')
@Controller('environment/:idEnv')
export class GroupController {
  constructor(
    private groupService: NodeGroupService,
    private environmentService: EnvironmentService,
  ) {}

  @Post('groups/')
  create(
    @Param('idEnv') idEnv: string,
    @Body() createGrouptDto: CreateGroupDto,
  ) {
    return this.groupService.create(idEnv, createGrouptDto);
  }

  @Get('groups/')
  async findAll(@Param('idEnv') idEnv: string) {
    const env = await this.environmentService.findOneBy({ name: idEnv });
    return env.groups;
  }

  @Get('groups/:idGroup')
  async findOne(
    @Param('idEnv') idEnv: string,
    @Param('idGroup') idGroup: string,
  ) {
    return await this.groupService.findOneBy({
      name: idGroup,
      environment: await this.environmentService.findOneBy({ name: idEnv }),
    });
  }

  @Patch('groups/:idGroup')
  update(
    @Param('idEnv') idEnv: string,
    @Param('idGroup') idGroup: string,
    @Body() updateGrouptDto: UpdateNodeDto,
  ) {
    return this.groupService.update(idGroup, updateGrouptDto);
  }

  @Delete('groups/:idGroup')
  remove(@Param('idEnv') idEnv: string, @Param('idGroup') idGroup: string) {
    return this.groupService.removeBy({ name: idGroup });
  }
}
