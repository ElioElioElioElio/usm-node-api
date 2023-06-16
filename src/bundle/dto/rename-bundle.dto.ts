import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBundleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  grpacks: [string];

  @ApiProperty()
  @IsOptional()
  @IsString()
  bundle?: string;
}
