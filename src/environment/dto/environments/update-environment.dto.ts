import { PartialType } from '@nestjs/mapped-types';
import { CreateEnvironmentDto } from './create-environment.dto';

export class UpdateEnvironmentDto extends PartialType(CreateEnvironmentDto) {}
