import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Ref,
} from '@mikro-orm/core';
import { Environment } from '../../environment/entities/environment.entity';
import { Grpack } from '../../grpack/entities/grpack.entity';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

@Entity()
export class Bundle {
  @PrimaryKey({ length: 50 })
  name!: string;

  @ManyToOne({
    cascade: [Cascade.REMOVE],
    serializer: (environment: Environment) => {
      return environment.name;
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
    serializer(bundle) {
      if (!!bundle) {
        return bundle.name;
      }
      return null;
    },
  })
  bundle?: Bundle;
}
