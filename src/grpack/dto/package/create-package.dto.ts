import { IsNotEmptyObject } from 'class-validator';
import { CreateOsDto } from '../os/create-os.dto';
import { CreatePackageDataDto } from '../packageDataDto/create-package-data.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty()
  @IsNotEmptyObject()
  readonly os: CreateOsDto;

  @ApiProperty()
  @IsNotEmptyObject()
  readonly packageData: CreatePackageDataDto;
}
