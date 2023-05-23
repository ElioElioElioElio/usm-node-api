import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
} from '@mikro-orm/core';
import { Grpack } from '../../grpack/entities/grpack.entity';
import { Environment } from '../../environment/entities/environment.entity';
import { Component } from '../../shared/entities/component.entity';
import { NodeGroup } from '../../node-group/entities/node-group.entity';
import { GrpackBundle } from '../../grpack-bundle/entities/grpack-bundle.entity';

@Entity()
export class Node extends Component {
  @ManyToOne({ cascade: [Cascade.REMOVE] })
  environment!: Environment;

  @ManyToMany(() => Grpack)
  grpacks? = new Collection<Grpack>(this);

  @ManyToOne({ cascade: [Cascade.REMOVE] })
  nodeGroup?: NodeGroup;

  @ManyToOne()
  grpackBundle?: GrpackBundle;
}
