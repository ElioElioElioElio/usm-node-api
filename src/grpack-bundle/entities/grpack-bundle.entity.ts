import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
} from '@mikro-orm/core';
import { Component } from '../../shared/entities/component.entity';
import { Environment } from '../../environment/entities/environment.entity';
import { Grpack } from '../../grpack/entities/grpack.entity';

@Entity()
export class GrpackBundle {
  @PrimaryKey({ length: 50 })
  name!: string;

  @ManyToOne({ cascade: [Cascade.REMOVE] })
  environment!: Environment;

  @ManyToMany(() => Grpack)
  grpacks? = new Collection<Grpack>(this);

  @ManyToOne()
  grpackBundled: GrpackBundle;
}
