import {
  Collection,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Ref,
} from '@mikro-orm/core';
import { Environment } from '../../environment/entities/environment.entity';
import { Grpack } from '../../grpack/entities/grpack.entity';

@Entity()
export class Bundle {
  @PrimaryKey({ length: 50 })
  name!: string;

  @ManyToOne({
    serializer: (environment: Environment) => {
      return environment.name;
    },
  })
  environment!: Environment;

  @ManyToMany({
    serializer(grpacks: Collection<Grpack>) {
      const test = grpacks.getItems().map((grpack) => {
        return grpack.name;
      });
      return test;
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
