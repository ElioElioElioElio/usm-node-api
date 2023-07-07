import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { GrpackFactory } from './factories/grpack/grpack.factory';
import { OsFactory } from './factories/grpack/os.factory';
import { PackageFactory } from './factories/grpack/package.factory';
import { getRandomInt } from '../shared/miscellaneous/functions/getRandomInt';
import { shuffleArray } from '../shared/miscellaneous/functions/shuffleArray';

export class GrpackSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const osList = [];
    osList.push(await new OsFactory(em).createOne({ osName: 'ubuntu' }));
    osList.push(await new OsFactory(em).createOne({ osName: 'windows' }));
    osList.push(await new OsFactory(em).createOne({ osName: 'darwin' }));
    osList.push(await new OsFactory(em).createOne({ osName: 'debian' }));

    const grpack = await new GrpackFactory(em)
      .each(async (grpack) => {
        const osForThisPackage = shuffleArray(osList).slice(
          0,
          getRandomInt(0, osList.length),
        );
        grpack.package.set(
          await new PackageFactory(em)
            .each((pckg) => {
              pckg.os = osForThisPackage.pop();
              pckg.grpack = grpack;
            })
            .create(osForThisPackage.length),
        );
      })
      .create(50);
  }
}
