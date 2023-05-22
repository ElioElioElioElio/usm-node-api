import { ApiProperty } from '@nestjs/swagger';

export class CreateGrpackDto {
  @ApiProperty()
  name: string;
}
