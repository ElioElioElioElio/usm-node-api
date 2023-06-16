import { Factory, Faker } from '@mikro-orm/seeder';
import { EntityData } from '@mikro-orm/core';
import { Node } from '../../../node/entities/node.entity';

export class NodeFactory extends Factory<Node> {
  model = Node;

  protected definition(faker: Faker): EntityData<Node> {
    return {
      name: faker.helpers.unique(() => {
        let str = '';
        faker.random.alpha(3) + '-';
        str += faker.random.alpha(3) + '-';
        str += faker.random.alpha(3) + '-';
        str += faker.random.alpha(1) + '-';
        str += faker.random.numeric(2) + '.';
        str += faker.internet.domainName();

        return str;
      }),
    };
  }
}
