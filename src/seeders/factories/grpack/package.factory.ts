import { Factory, Faker } from '@mikro-orm/seeder';
import { EntityData } from '@mikro-orm/core';
import { Package } from '../../../grpack/entities/package.entity';

export class PackageFactory extends Factory<Package> {
  model = Package;

  protected definition(faker: Faker): EntityData<Package> {
    return {
      packageName: faker.helpers.unique(() => {
        return faker.name.firstName() + '_' + faker.random.alphaNumeric(3);
      }),
      version:
        faker.random.numeric(1) +
        '.' +
        faker.random.numeric(1) +
        '.' +
        faker.random.numeric(2),
    };
  }
}
