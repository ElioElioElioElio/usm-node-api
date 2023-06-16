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
import { Bundle } from '../../bundle/entities/bundle.entity';

@Entity()
export class Group extends Component {
  @ManyToOne({
    cascade: [Cascade.REMOVE],
    serializer(environment: Environment) {
      return environment.name;
    },
  })
  environment!: Environment;

  @ManyToOne({
    cascade: [Cascade.REMOVE],
    serializer(bundle: Bundle) {
      if (!!bundle) {
        return bundle.name;
      }
      return null;
    },
  })
  bundle?: Bundle;

  @ManyToMany({
    serializer(grpacks: Collection<Grpack>) {
      return grpacks.getItems().map((grpack) => {
        return grpack.name;
      });
    },
  })
  grpacks? = new Collection<Grpack>(this);

  @OneToMany(() => Node, (node) => node.group, {
    serializer(nodes: Collection<Node>) {
      return nodes.getItems().map((node) => {
        return node.name;
      });
    },
  })
  nodes? = new Collection<Node>(this);
}
