import { Factory, Faker } from '@mikro-orm/seeder';
import { EntityData } from '@mikro-orm/core';
import { Bundle } from '../../../bundle/entities/bundle.entity';

export class BundleFactory extends Factory<Bundle> {
  model = Bundle;

  protected definition(faker: Faker): EntityData<Bundle> {
    return {
      name: faker.helpers.unique(() => {
        return faker.random.alpha(3) + '_' + faker.random.alpha(4);
      }),
    };
  }
}
