import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class Component {
  @PrimaryKey({ length: 50 })
  name!: string;
}
