import { Factory, Faker } from '@mikro-orm/seeder';
import { Constructor } from '@mikro-orm/core';
import { Os } from '../../../grpack/entities/os.entity';

export class OsFactory extends Factory<Os> {
  model = Os;

  definition(faker: Faker): Partial<Os> {
    return {
      osName: faker.helpers.unique(() => {
        return (
          faker.animal.dog +
          ' ' +
          faker.random.alphaNumeric(1) +
          '.' +
          faker.random.alphaNumeric(1) +
          '.' +
          faker.random.alphaNumeric(1) +
          '.'
        );
      }),
    };
  }
}
