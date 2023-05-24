import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NodeGroupService } from './node-group.service';
import { CreateNodeGroupDto } from './dto/create-node-group.dto';
import { UpdateNodeGroupDto } from './dto/update-node-group.dto';

@Controller('node-group')
export class NodeGroupController {
  constructor(private readonly nodeGroupService: NodeGroupService) {}

  @Post()
  create(@Body() createNodeGroupDto: CreateNodeGroupDto) {
    return this.nodeGroupService.create(createNodeGroupDto);
  }

  @Get()
  async findAll() {
    return await this.nodeGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodeGroupService.findBy({ name: id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNodeGroupDto: UpdateNodeGroupDto,
  ) {
    return this.nodeGroupService.update(id, updateNodeGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodeGroupService.removeBy({ name: id });
  }
}
