import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NodeService } from './node.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';

@Controller('node')
export class NodeController {
  constructor(private readonly nodeService: NodeService) {}

  @Post()
  create(@Body() createNodeDto: CreateNodeDto) {
    return this.nodeService.create(createNodeDto);
  }

  @Get()
  findAll() {
    return this.nodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nodeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodeDto: UpdateNodeDto) {
    return this.nodeService.update(+id, updateNodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nodeService.remove(+id);
  }
}
