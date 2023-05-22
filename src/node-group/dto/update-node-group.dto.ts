import { PartialType } from '@nestjs/mapped-types';
import { CreateNodeGroupDto } from './create-node-group.dto';

export class UpdateNodeGroupDto extends PartialType(CreateNodeGroupDto) {}
