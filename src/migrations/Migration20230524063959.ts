import { Migration } from '@mikro-orm/migrations';

export class Migration20230524063959 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "node" drop constraint "node_grpack_bundled_name_foreign";');

    this.addSql('alter table "node_group" add column "grpack_bundle_name" varchar(50) null;');
    this.addSql('alter table "node_group" add constraint "node_group_grpack_bundle_name_foreign" foreign key ("grpack_bundle_name") references "grpack_bundle" ("name") on delete cascade;');

    this.addSql('alter table "node" add column "grpack_bundle_name" varchar(50) null;');
    this.addSql('alter table "node" add constraint "node_grpack_bundle_name_foreign" foreign key ("grpack_bundle_name") references "grpack_bundle" ("name") on update cascade on delete set null;');
    this.addSql('alter table "node" drop column "grpack_bundled_name";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "node_group" drop constraint "node_group_grpack_bundle_name_foreign";');

    this.addSql('alter table "node" drop constraint "node_grpack_bundle_name_foreign";');

    this.addSql('alter table "node_group" drop column "grpack_bundle_name";');

    this.addSql('alter table "node" add column "grpack_bundled_name" varchar(50) not null;');
    this.addSql('alter table "node" add constraint "node_grpack_bundled_name_foreign" foreign key ("grpack_bundled_name") references "grpack_bundle" ("name") on update cascade;');
    this.addSql('alter table "node" drop column "grpack_bundle_name";');
  }

}
