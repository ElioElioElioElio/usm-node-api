import { Factory, Faker } from '@mikro-orm/seeder';
import { EntityData } from '@mikro-orm/core';
import { Grpack } from '../../../grpack/entities/grpack.entity';

export class GrpackFactory extends Factory<Grpack> {
  model = Grpack;

  protected definition(faker: Faker): EntityData<Grpack> {
    return {
      name: faker.helpers.unique(() => {
        return faker.name.lastName() + '_' + faker.random.alphaNumeric(3);
      }),
    };
  }
}
