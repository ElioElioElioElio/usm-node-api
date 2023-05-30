import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EnvironmentService } from '../environment.service';
import { CreateEnvironmentDto } from '../dto/environments/create-environment.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateEnvironmentDto } from '../dto/environments/update-environment.dto';

@ApiTags('environment')
@Controller('environment')
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Post()
  create(@Body() createEnvironmentDto: CreateEnvironmentDto) {
    return this.environmentService.create(createEnvironmentDto);
  }

  @Get()
  async findAll() {
    return await this.environmentService.findAll();
  }

  @Get(':idEnv')
  @ApiParam({
    name: 'idEnv',
    required: true,
    type: 'string',
  })
  findOne(@Param('idEnv') id: string) {
    return this.environmentService.findOneBy({ name: id });
  }

  @Patch(':idEnv')
  @ApiParam({
    name: 'idEnv',
    required: true,
    type: 'string',
  })
  update(
    @Param('idEnv') id: string,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ) {
    return this.environmentService.update(id, updateEnvironmentDto);
  }

  @Delete(':idEnv')
  @ApiParam({
    name: 'idEnv',
    required: true,
    type: 'string',
  })
  async remove(@Param('idEnv') id: string) {
    return await this.environmentService.removeBy({ name: id });
  }
}
