import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OsService } from '../services/os.service';
import { CreateOsDto } from '../dto/os/create-os.dto';
import { serialize } from '@mikro-orm/core';
import { UpdateOsDto } from '../dto/os/update-os.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('os')
@ApiTags('os')
export class OsController {
  constructor(private readonly osService: OsService) {}

  @Post()
  async create(@Body() createOsDto: CreateOsDto) {
    return await this.osService.create(createOsDto);
  }

  @Get()
  findAll() {
    return this.osService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.osService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOsDto: UpdateOsDto) {
    return this.osService.update(id, updateOsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.osService.remove(id);
  }
}
