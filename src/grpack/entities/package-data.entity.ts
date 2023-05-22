import { Entity, PrimaryKey, PrimaryKeyType } from '@mikro-orm/core';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class PackageData {
  @PrimaryKey()
  @IsString()
  @IsNotEmpty()
  packageName!: string;

  @PrimaryKey()
  @IsString()
  @IsNotEmpty()
  version!: string;

  [PrimaryKeyType]?: [string, string];
}
