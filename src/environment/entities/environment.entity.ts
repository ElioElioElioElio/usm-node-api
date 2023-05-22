import { Collection, Entity, OneToMany } from '@mikro-orm/core';
import { Component } from '../../shared/entities/component.entity';
import { Node } from '../../node/entities/node.entity';
import { NodeGroup } from '../../node-group/entities/node-group.entity';
import { GrpackBundle } from '../../grpack-bundle/entities/grpack-bundle.entity';

@Entity()
//@Filter({ name: 'id', cond: (args) => ({ name: { name: args.name } }) })
export class Environment extends Component {
  @OneToMany(() => Node, (node) => node.environment)
  nodes = new Collection<Node>(this);

  @OneToMany(() => NodeGroup, (nodeGrp) => nodeGrp.environment)
  nodeGroups = new Collection<NodeGroup>(this);

  @OneToMany(() => GrpackBundle, (grpBundle) => grpBundle.environment) 3;
  grpackBundle = new Collection<GrpackBundle>(this);
}
