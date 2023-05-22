import { PartialType } from '@nestjs/mapped-types';
import { CreateGrpackBundleDto } from './create-grpack-bundle.dto';

export class UpdateGrpackBundleDto extends PartialType(CreateGrpackBundleDto) {}
