import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from '@mikro-orm/core';
import { Environment } from '../../environment/entities/environment.entity';
import { Grpack } from '../../grpack/entities/grpack.entity';
import { Node } from '../../node/entities/node.entity';
import { Component } from '../../shared/entities/component.entity';
import { GrpackBundle } from '../../grpack-bundle/entities/grpack-bundle.entity';

@Entity()
export class NodeGroup extends Component {
  @ManyToOne({ cascade: [Cascade.REMOVE] })
  environment!: Environment;

  @ManyToOne({ cascade: [Cascade.REMOVE] })
  grpackBundle?: GrpackBundle;

  @ManyToMany(() => Grpack)
  grpacks? = new Collection<Grpack>(this);

  @OneToMany(() => Node, (node) => node.nodeGroup)
  nodes? = new Collection<Node>(this);
}
