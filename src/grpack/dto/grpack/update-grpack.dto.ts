import { PartialType } from '@nestjs/swagger';
import { CreateGrpackDto } from './create-grpack.dto';

export class UpdateGrpackDto extends PartialType(CreateGrpackDto) {}
