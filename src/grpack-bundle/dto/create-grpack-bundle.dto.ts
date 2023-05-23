import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGrpackBundleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  environment: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  grpacks: [string];

  @ApiProperty()
  @IsOptional()
  @IsString()
  grpackBundle: string;
}
