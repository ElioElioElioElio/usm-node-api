import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateNodeGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  environment!: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  grpacks?: [string];

  @ApiProperty()
  @IsOptional()
  @IsString()
  grpackBundle?: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  nodes?: [string];
}
