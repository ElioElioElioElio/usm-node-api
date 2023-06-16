import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { version } from 'prettier';

export class CreatePackageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly os!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly packageName!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly version!: string;
}
