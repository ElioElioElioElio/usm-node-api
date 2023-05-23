import { Collection, Entity, OneToMany } from '@mikro-orm/core';
import { Package } from './package.entity';
import { Component } from '../../shared/entities/component.entity';

@Entity()
export class Grpack extends Component {
  @OneToMany(() => Package, (pckg) => pckg.grpack)
  package = new Collection<Package>(this);
}
