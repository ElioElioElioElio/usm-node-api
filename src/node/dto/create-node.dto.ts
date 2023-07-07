import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateNodeDto {
  @ApiProperty({ required: true, type: String })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  grpacks?: [string];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bundle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  group?: string;
}
