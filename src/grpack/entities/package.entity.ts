import {
  Cascade,
  Entity,
  ManyToOne,
  Property,
  PrimaryKeyType,
} from '@mikro-orm/core';
import { Os } from './os.entity';
import { Grpack } from './grpack.entity';
import { IsString, IsNotEmpty } from 'class-validator';

@Entity()
export class Package {
  @ManyToOne({ primary: true })
  os!: Os;

  @Property()
  @IsString()
  @IsNotEmpty()
  packageName!: string;

  @Property()
  @IsString()
  @IsNotEmpty()
  version!: string;

  @ManyToOne({ primary: true, cascade: [Cascade.REMOVE] })
  grpack!: Grpack;

  [PrimaryKeyType]?: [Os, Grpack];
}
