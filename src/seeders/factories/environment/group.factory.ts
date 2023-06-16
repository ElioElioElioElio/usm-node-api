import { Factory, Faker } from '@mikro-orm/seeder';
import { EntityData } from '@mikro-orm/core';
import { Group } from '../../../group/entities/group.entity';

export class GroupFactory extends Factory<Group> {
  model = Group;

  protected definition(faker: Faker): EntityData<Group> {
    return {
      name: faker.helpers.unique(() => faker.random.numeric(3)),
    };
  }
}
