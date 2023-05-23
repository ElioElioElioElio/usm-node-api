import { Migration } from '@mikro-orm/migrations';

export class Migration20230523072639 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "grpack_bundle" drop constraint "grpack_bundle_grpack_bundle_name_foreign";');

    this.addSql('alter table "grpack_bundle" alter column "grpack_bundle_name" type varchar(50) using ("grpack_bundle_name"::varchar(50));');
    this.addSql('alter table "grpack_bundle" alter column "grpack_bundle_name" drop not null;');
    this.addSql('alter table "grpack_bundle" add constraint "grpack_bundle_grpack_bundle_name_foreign" foreign key ("grpack_bundle_name") references "grpack_bundle" ("name") on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "grpack_bundle" drop constraint "grpack_bundle_grpack_bundle_name_foreign";');

    this.addSql('alter table "grpack_bundle" alter column "grpack_bundle_name" type varchar(50) using ("grpack_bundle_name"::varchar(50));');
    this.addSql('alter table "grpack_bundle" alter column "grpack_bundle_name" set not null;');
    this.addSql('alter table "grpack_bundle" add constraint "grpack_bundle_grpack_bundle_name_foreign" foreign key ("grpack_bundle_name") references "grpack_bundle" ("name") on update cascade;');
  }

}
