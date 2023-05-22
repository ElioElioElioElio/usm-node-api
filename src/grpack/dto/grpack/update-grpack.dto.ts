import { PartialType } from '@nestjs/mapped-types';
import { CreateGrpackDto } from './create-grpack.dto';

export class UpdateGrpackDto extends PartialType(CreateGrpackDto) {}
