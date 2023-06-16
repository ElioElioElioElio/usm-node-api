import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  grpacks?: [string];

  @ApiProperty()
  @IsOptional()
  @IsString()
  bundle?: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  nodes?: [string];
}
