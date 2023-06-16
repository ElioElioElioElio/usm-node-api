import { PartialType } from '@nestjs/mapped-types';
import { CreateBundleDto } from './rename-bundle.dto';

export class UpdateBundleDto extends PartialType(CreateBundleDto) {}
