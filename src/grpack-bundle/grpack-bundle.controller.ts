import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GrpackBundleService } from './grpack-bundle.service';
import { CreateGrpackBundleDto } from './dto/create-grpack-bundle.dto';
import { UpdateGrpackBundleDto } from './dto/update-grpack-bundle.dto';

@Controller('grpack-bundle')
export class GrpackBundleController {
  constructor(private readonly grpackBundleService: GrpackBundleService) {}

  @Post()
  create(@Body() createGrpackBundleDto: CreateGrpackBundleDto) {
    return this.grpackBundleService.create(createGrpackBundleDto);
  }

  @Get()
  findAll() {
    return this.grpackBundleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grpackBundleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGrpackBundleDto: UpdateGrpackBundleDto) {
    return this.grpackBundleService.update(+id, updateGrpackBundleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.grpackBundleService.remove(+id);
  }
}
