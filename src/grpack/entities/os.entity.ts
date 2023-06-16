import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class Os {
  @PrimaryKey()
  osName: string;
}
