import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly osName!: string;
}
