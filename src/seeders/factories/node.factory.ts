import { Factory, Faker } from '@mikro-orm/seeder';
import { Node } from '../../node/entities/node.entity';
import { EntityData } from '@mikro-orm/core';
import { Grpack } from '../../grpack/entities/grpack.entity';

export class NodeFactory extends Factory<Node> {
  model = Node;

  protected definition(faker: Faker): EntityData<Grpack> {
    return {
      name: faker.helpers.unique(() => {
        return faker.name.lastName() + '_' + faker.random.alphaNumeric(3);
      }),
    };
  }
}
