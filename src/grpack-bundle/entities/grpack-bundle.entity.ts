import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
} from '@mikro-orm/core';
import { Component } from '../../shared/entities/component.entity';
import { Environment } from '../../environment/entities/environment.entity';
import { Grpack } from '../../grpack/entities/grpack.entity';

@Entity()
export class GrpackBundle extends Component {
  @ManyToOne({ cascade: [Cascade.REMOVE] })
  environment!: Environment;

  @ManyToMany(() => Grpack)
  grpacks? = new Collection<Grpack>(this);

  @ManyToOne()
  grpackBundle!: GrpackBundle;
}
