import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreatePackageDataDto } from '../dto/packageDataDto/create-package-data.dto';
import { PackageDataService } from '../services/package-data.service';
import {
  UniqueConstraintViolationException,
  ValidationError,
} from '@mikro-orm/core';
import { PackageData } from '../entities/package-data.entity';
import { validate } from 'class-validator';

@Controller('package-data')
export class PackageDataController {
  constructor(private readonly packageDataService: PackageDataService) {}

  @Get()
  findAll() {
    return this.packageDataService.findAll();
  }

  @Post()
  async create(@Body() createPackageDataDto: CreatePackageDataDto) {
    try {
      return await this.packageDataService.create(createPackageDataDto);
    } catch (err: unknown) {
      if (err instanceof UniqueConstraintViolationException) {
        throw new HttpException('duplicated packageData', HttpStatus.CONFLICT);
      } else if (err instanceof ValidationError) {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      } else {
        throw err;
      }
    }
  }
}
