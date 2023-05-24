import { IsNotEmpty, IsOptional } from 'class-validator';
import { CreateNodeGroupDto } from '../../../node-group/dto/create-node-group.dto';
import { CreateGrpackBundleDto } from '../../../grpack-bundle/dto/create-grpack-bundle.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnvironmentDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly name: string;
}
