import { Entity, PrimaryKey, PrimaryKeyType } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class Component {
  @PrimaryKey({ type: 'string', length: 50 })
  public name!: string;

  [PrimaryKeyType]?: string;
}

export type ComponentType = Component;
