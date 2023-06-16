import { Collection, Entity, OneToMany } from '@mikro-orm/core';
import { Component } from '../../shared/entities/component.entity';
import { Node } from '../../node/entities/node.entity';
import { Group } from '../../group/entities/group.entity';
import { Bundle } from '../../bundle/entities/bundle.entity';

@Entity()
export class Environment extends Component {
  @OneToMany(() => Node, (node) => node.environment, {
    serializer(nodes: Collection<Node>) {
      return nodes.getItems().map((node) => {
        return node.name;
      });
    },
  })
  nodes = new Collection<Node>(this);

  @OneToMany(() => Group, (nodeGrp) => nodeGrp.environment, {
    serializer(nodes: Collection<Group>) {
      return nodes.getItems().map((node) => {
        return node.name;
      });
    },
  })
  groups = new Collection<Group>(this);

  @OneToMany(() => Bundle, (grpBundle) => grpBundle.environment, {
    serializer(nodes: Collection<Bundle>) {
      return nodes.getItems().map((node) => {
        return node.name;
      });
    },
  })
  bundles = new Collection<Bundle>(this);
}
