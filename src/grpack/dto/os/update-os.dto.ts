import { PartialType } from '@nestjs/swagger';
import { CreateOsDto } from './create-os.dto';

export class UpdateOsDto extends PartialType(CreateOsDto) {}
