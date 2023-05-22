import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePackageDataDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly packageName!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly version!: string;
}
