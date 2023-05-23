import { Migration } from '@mikro-orm/migrations';

export class Migration20230523101151 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "grpack" alter column "name" type varchar(50) using ("name"::varchar(50));');

    this.addSql('alter table "grpack_bundle_grpacks" alter column "grpack_name" type varchar(50) using ("grpack_name"::varchar(50));');

    this.addSql('alter table "node_group_grpacks" alter column "grpack_name" type varchar(50) using ("grpack_name"::varchar(50));');

    this.addSql('alter table "node_grpacks" alter column "grpack_name" type varchar(50) using ("grpack_name"::varchar(50));');

    this.addSql('alter table "package" alter column "grpack_name" type varchar(50) using ("grpack_name"::varchar(50));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "grpack" alter column "name" type varchar(255) using ("name"::varchar(255));');

    this.addSql('alter table "grpack_bundle_grpacks" alter column "grpack_name" type varchar(255) using ("grpack_name"::varchar(255));');

    this.addSql('alter table "node_group_grpacks" alter column "grpack_name" type varchar(255) using ("grpack_name"::varchar(255));');

    this.addSql('alter table "node_grpacks" alter column "grpack_name" type varchar(255) using ("grpack_name"::varchar(255));');

    this.addSql('alter table "package" alter column "grpack_name" type varchar(255) using ("grpack_name"::varchar(255));');
  }

}
