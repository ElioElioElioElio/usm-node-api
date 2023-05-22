import { Entity, PrimaryKey, PrimaryKeyType } from '@mikro-orm/core';

@Entity()
export class Os {
  @PrimaryKey()
  osName: string;

  @PrimaryKey()
  version: string;

  [PrimaryKeyType]?: [string, string];
}
