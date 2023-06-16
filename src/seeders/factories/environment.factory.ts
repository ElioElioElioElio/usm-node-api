import { Factory, Faker } from '@mikro-orm/seeder';
import { Environment } from '../../environment/entities/environment.entity';
import { EntityData } from '@mikro-orm/core';

export class EnvironmentFactory extends Factory<Environment> {
  model = Environment;

  protected definition(faker: Faker): EntityData<Environment> {
    return {
      name: faker.helpers.unique(() => {
        return (
          faker.random.alpha(3).toUpperCase() +
          '_' +
          faker.random.alpha(3).toUpperCase()
        );
      }),
    };
  }
}
