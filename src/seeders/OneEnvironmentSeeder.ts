import { EntityManager } from '@mikro-orm/core';
import { Faker, Seeder, faker } from '@mikro-orm/seeder';
import { OsFactory } from './factories/grpack/os.factory';
import { PackageFactory } from './factories/grpack/package.factory';
import { GrpackFactory } from './factories/grpack/grpack.factory';
import { BundleFactory } from './factories/environment/bundle.factory';
import { getRandomInt } from '../shared/miscellaneous/functions/getRandomInt';
import { shuffleArray } from '../shared/miscellaneous/functions/shuffleArray';
import { Environment } from '../environment/entities/environment.entity';
import { Grpack } from '../grpack/entities/grpack.entity';
import { EnvironmentFactory } from './factories/environment.factory';
import { NodeFactory } from './factories/node.factory';
import { GroupFactory } from './factories/environment/group.factory';
export { faker, Faker };

export class OneEnvironmentSeeder extends Seeder {
  async run(em: EntityManager, faker: Faker): Promise<void> {
    // ---------------------------------- OS
    const osList = [];
    osList.push(await new OsFactory(em).createOne({ osName: 'ubuntu' }));
    osList.push(await new OsFactory(em).createOne({ osName: 'windows' }));
    osList.push(await new OsFactory(em).createOne({ osName: 'darwin' }));
    osList.push(await new OsFactory(em).createOne({ osName: 'debian' }));

    // ---------------------------------- Grpacks
    const grpackList = await new GrpackFactory(em)
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

    // ----------------------------------------------------------------------------------------------------------------- Environments
    const env = new EnvironmentFactory(em)
      .each((env) => {
        // --------------------------------------------------------------------------------------- Environments/Bundles
        const bundleList = this.createBundles(
          getRandomInt(5, 15),
          env,
          grpackList,
          em,
        );
        env.bundles.set(bundleList);

        // --------------------------------------------------------------------------------------- Environments/Nodes
        env.nodes.set(
          new NodeFactory(em)
            .each((node) => {
              node.environment = env;
              node.grpacks.set(
                shuffleArray(grpackList).slice(0, getRandomInt(3, 15)),
              );
              node.bundle =
                bundleList[Math.floor(Math.random() * bundleList.length)];
            })
            .make(getRandomInt(25, 75)),
        );

        // --------------------------------------------------------------------------------------- Environments/Groups
        env.groups.set(
          new GroupFactory(em)
            .each((group) => {
              // -------------------------------------------------------------- Environments/Group/Environment
              group.environment = env;

              // -------------------------------------------------------------- Environments/Group/Bundle
              group.bundle =
                bundleList[Math.floor(Math.random() * bundleList.length)];

              // -------------------------------------------------------------- Environments/Group/Grpacks
              group.grpacks.set(
                shuffleArray(grpackList).slice(0, getRandomInt(7, 15)),
              );

              // -------------------------------------------------------------- Environments/Group/Nodes
              group.nodes.set(
                new NodeFactory(em)
                  .each((node) => {
                    // ------------------------------- Environments/Group/Nodes/Environment
                    node.environment = env;

                    // ------------------------------- Environments/Group/Nodes/Group
                    node.group = group;
                  })
                  .make(getRandomInt(7, 15)),
              );
            })
            .make(10),
        );
      })
      .createOne();

    em.flush();
  }

  createBundles(
    nbBundle: number,
    environment: Environment,
    grpackList: Grpack[],
    em: EntityManager,
  ) {
    const res = [];
    while (nbBundle != 0) {
      const randomInt = getRandomInt(1, nbBundle);
      nbBundle -= randomInt;
      res.push(
        ...this.createBundledBundles(randomInt, environment, grpackList, em),
      );
    }
    return res;
  }

  createBundledBundles(
    nbBundle: number,
    environment: Environment,
    grpackList: Grpack[],
    em: EntityManager,
  ) {
    const res = new BundleFactory(em)
      .each(async (bundle) => {
        bundle.grpacks.set(
          shuffleArray(grpackList).slice(0, getRandomInt(3, 15)),
        );
        bundle.environment = environment;
      })
      .make(nbBundle);

    for (let i = 0; i < res.length - 1; i++) {
      res[i].bundle = res[i + 1];
    }
    return res;
  }
}
