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
import { Group } from '../../group/entities/group.entity';
import { Bundle } from '../../bundle/entities/bundle.entity';

@Entity()
export class Node extends Component {
  @ManyToOne({
    cascade: [Cascade.REMOVE],
    serializer(env: Environment) {
      return env.name;
    },
  })
  environment!: Environment;

  @ManyToMany({
    serializer(grpacks: Collection<Grpack>) {
      /*
      console.log('serialize: ');
      console.log(value);
      */
      return grpacks.getItems().map((grpack) => {
        return grpack.name;
      });
    },
  })
  grpacks? = new Collection<Grpack>(this);

  @ManyToOne({
    cascade: [Cascade.REMOVE],
    serializer(group: Group) {
      if (!!group) {
        return group.name;
      }
      return null;
    },
  })
  group?: Group;

  @ManyToOne({
    serializer(bundle: Bundle) {
      if (!!bundle) {
        return bundle.name;
      }
      return null;
    },
  })
  bundle?: Bundle;
}
