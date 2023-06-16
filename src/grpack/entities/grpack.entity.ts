import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { Package } from './package.entity';
import { Component } from '../../shared/entities/component.entity';
import { version } from 'prettier';

@Entity()
export class Grpack extends Component {
  @OneToMany(() => Package, (pckg) => pckg.grpack, { hidden: true })
  package = new Collection<Package>(this);

  @Property({ persist: false })
  get packages() {
    const pkgs = {};
    this.package.toArray().forEach((pkg) => {
      pkgs[pkg.os.osName] = {
        packageName: pkg.packageName,
        version: pkg.version,
      };
    });

    return pkgs;
  }

  /*
  @Property({ persist: false })
  get test() {
    const test = new Map<string, PackageData>();

    const os = new Os();
    os.osName = 'osName';
    os.version = '1.2.3';

    const pckg = new PackageData();
    pckg.packageName = 'pckgName';
    pckg.version = '1.2.3';

    test[os.toString()] = pckg;

    test.set(os.toString(), pckg);

    console.log(test);

    return test;
  }
  */
}
