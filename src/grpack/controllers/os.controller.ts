import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OsService } from '../services/os.service';
import { CreateOsDto } from '../dto/os/create-os.dto';
import { UniqueConstraintViolationException, serialize } from '@mikro-orm/core';
import { UpdateOsDto } from '../dto/os/update-os.dto';

@Controller('os')
export class OsController {
  constructor(private readonly osService: OsService) {}

  @Post()
  async create(@Body() createOsDto: CreateOsDto) {
    try {
      return serialize(await this.osService.create(createOsDto));
    } catch (err: unknown) {
      if (err instanceof UniqueConstraintViolationException) {
        throw new HttpException('duplicate os', HttpStatus.CONFLICT);
      }
    }
  }

  @Get()
  findAll() {
    return this.osService.findAll();
  }

  @Get(':id/:version')
  findOne(@Param('id') id: string, @Param('version') version: string) {
    return this.osService.findOne(id, version);
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
