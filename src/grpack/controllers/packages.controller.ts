import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PackagesService } from '../services/packages.service';
import { ApiTags } from '@nestjs/swagger';
import { CreatePackageDto } from '../dto/packages/create-package.dto';
import { UpdatePackageDto } from '../dto/packages/update-package.dto';

@Controller('grpack/:grpackName/packages')
@ApiTags('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  create(
    @Param('grpackName') grpackName: string,
    @Body() createPackageDto: CreatePackageDto,
  ) {
    return this.packagesService.create(grpackName, createPackageDto);
  }

  @Get()
  findAll(@Param('grpackName') grpackName: string) {
    return this.packagesService.findAll(grpackName);
  }

  @Get(':osName')
  findOne(
    @Param('grpackName') grpackName: string,
    @Param('osName') osName: string,
  ) {
    return this.packagesService.findOne(grpackName, osName);
  }

  @Patch(':osName')
  update(
    @Param('grpackName') grpackName: string,
    @Param('osName') osName: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ) {
    return this.packagesService.update(grpackName, osName, updatePackageDto);
  }

  @Delete(':osName')
  async remove(
    @Param('grpackName') grpackName: string,
    @Param('osName') osName: string,
  ) {
    return await this.packagesService.remove(grpackName, osName);
  }
}
