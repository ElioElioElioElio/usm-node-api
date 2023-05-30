import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreatePackageDataDto } from '../dto/packageDataDto/create-package-data.dto';
import { PackageDataService } from '../services/package-data.service';

@Controller('package-data')
export class PackageDataController {
  constructor(private readonly packageDataService: PackageDataService) {}

  @Get()
  findAll() {
    return this.packageDataService.findAll();
  }

  @Post()
  async create(@Body() createPackageDataDto: CreatePackageDataDto) {
    return await this.packageDataService.create(createPackageDataDto);
  }
}
