import { Entity, ManyToOne } from '@mikro-orm/core';
import { Os } from './os.entity';
import { PackageData } from './package-data.entity';
import { Grpack } from './grpack.entity';

@Entity()
export class Package {
  @ManyToOne({ primary: true })
  os!: Os;

  @ManyToOne({ primary: true })
  packageData!: PackageData;

  @ManyToOne()
  grpack!: Grpack;
}
