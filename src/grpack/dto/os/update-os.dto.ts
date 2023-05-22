import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateOsDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly osName: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly version: string;
}
