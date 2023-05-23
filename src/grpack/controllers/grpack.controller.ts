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
import { GrpackService } from '../services/grpack.service';
import { UpdateGrpackDto } from '../dto/grpack/update-grpack.dto';
import { CreateGrpackDto } from '../dto/grpack/create-grpack.dto';
import { CreatePackageDto } from '../dto/package/create-package.dto';
import { NotFoundError } from '@mikro-orm/core';

@Controller('grpack')
export class GrpackController {
  constructor(private readonly grpackService: GrpackService) {}

  @Post()
  create(@Body() createGrpackDto: CreateGrpackDto) {
    return this.grpackService.create(createGrpackDto);
  }

  @Get()
  findAll() {
    return this.grpackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grpackService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrpackDto: UpdateGrpackDto) {
    return this.grpackService.update(+id, updateGrpackDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.grpackService.remove(id);
    } catch (err: unknown) {
      if (err instanceof NotFoundError) {
        throw new HttpException(
          "grpack named '" + id + "' not found",
          HttpStatus.NOT_FOUND,
        );
      }
    }
  }

  @Post(':id/package')
  addPackage(@Param('id') id: string, @Body() packageDto: CreatePackageDto) {
    return this.grpackService.addPackage(id, packageDto);
  }
}
