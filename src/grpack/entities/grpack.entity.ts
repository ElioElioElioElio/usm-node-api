import { Collection, Entity, OneToMany, PrimaryKey } from '@mikro-orm/core';
import { Component } from '../../shared/entities/component.entity';
import { Package } from './package.entity';

@Entity()
export class Grpack extends Component {
  @PrimaryKey()
  name!: string;

  @OneToMany(() => Package, (pckg) => pckg.grpack)
  package = new Collection<Package>(this);
}
