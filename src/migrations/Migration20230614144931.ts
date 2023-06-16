import { Migration } from '@mikro-orm/migrations';

export class Migration20230614144931 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "environment" ("name" varchar(50) not null, constraint "environment_pkey" primary key ("name"));');

    this.addSql('create table "bundle" ("name" varchar(50) not null, "environment_name" varchar(50) null, "bundle_name" varchar(50) null, constraint "bundle_pkey" primary key ("name"));');

    this.addSql('create table "group" ("name" varchar(50) not null, "environment_name" varchar(50) null, "bundle_name" varchar(50) null, constraint "group_pkey" primary key ("name"));');

    this.addSql('create table "grpack" ("name" varchar(50) not null, constraint "grpack_pkey" primary key ("name"));');

    this.addSql('create table "group_grpacks" ("group_name" varchar(50) not null, "grpack_name" varchar(50) not null, constraint "group_grpacks_pkey" primary key ("group_name", "grpack_name"));');

    this.addSql('create table "bundle_grpacks" ("bundle_name" varchar(50) not null, "grpack_name" varchar(50) not null, constraint "bundle_grpacks_pkey" primary key ("bundle_name", "grpack_name"));');

    this.addSql('create table "node" ("name" varchar(50) not null, "environment_name" varchar(50) null, "group_name" varchar(50) null, "bundle_name" varchar(50) null, constraint "node_pkey" primary key ("name"));');

    this.addSql('create table "node_grpacks" ("node_name" varchar(50) not null, "grpack_name" varchar(50) not null, constraint "node_grpacks_pkey" primary key ("node_name", "grpack_name"));');

    this.addSql('create table "os" ("os_name" varchar(255) not null, constraint "os_pkey" primary key ("os_name"));');

    this.addSql('create table "package" ("os_os_name" varchar(255) not null, "grpack_name" varchar(50) null, "package_name" varchar(255) not null, "version" varchar(255) not null, constraint "package_pkey" primary key ("os_os_name", "grpack_name"));');

    this.addSql('alter table "bundle" add constraint "bundle_environment_name_foreign" foreign key ("environment_name") references "environment" ("name") on delete cascade;');
    this.addSql('alter table "bundle" add constraint "bundle_bundle_name_foreign" foreign key ("bundle_name") references "bundle" ("name") on update cascade on delete set null;');

    this.addSql('alter table "group" add constraint "group_environment_name_foreign" foreign key ("environment_name") references "environment" ("name") on delete cascade;');
    this.addSql('alter table "group" add constraint "group_bundle_name_foreign" foreign key ("bundle_name") references "bundle" ("name") on delete cascade;');

    this.addSql('alter table "group_grpacks" add constraint "group_grpacks_group_name_foreign" foreign key ("group_name") references "group" ("name") on update cascade on delete cascade;');
    this.addSql('alter table "group_grpacks" add constraint "group_grpacks_grpack_name_foreign" foreign key ("grpack_name") references "grpack" ("name") on update cascade on delete cascade;');

    this.addSql('alter table "bundle_grpacks" add constraint "bundle_grpacks_bundle_name_foreign" foreign key ("bundle_name") references "bundle" ("name") on update cascade on delete cascade;');
    this.addSql('alter table "bundle_grpacks" add constraint "bundle_grpacks_grpack_name_foreign" foreign key ("grpack_name") references "grpack" ("name") on update cascade on delete cascade;');

    this.addSql('alter table "node" add constraint "node_environment_name_foreign" foreign key ("environment_name") references "environment" ("name") on delete cascade;');
    this.addSql('alter table "node" add constraint "node_group_name_foreign" foreign key ("group_name") references "group" ("name") on delete cascade;');
    this.addSql('alter table "node" add constraint "node_bundle_name_foreign" foreign key ("bundle_name") references "bundle" ("name") on update cascade on delete set null;');

    this.addSql('alter table "node_grpacks" add constraint "node_grpacks_node_name_foreign" foreign key ("node_name") references "node" ("name") on update cascade on delete cascade;');
    this.addSql('alter table "node_grpacks" add constraint "node_grpacks_grpack_name_foreign" foreign key ("grpack_name") references "grpack" ("name") on update cascade on delete cascade;');

    this.addSql('alter table "package" add constraint "package_os_os_name_foreign" foreign key ("os_os_name") references "os" ("os_name") on update cascade;');
    this.addSql('alter table "package" add constraint "package_grpack_name_foreign" foreign key ("grpack_name") references "grpack" ("name") on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "bundle" drop constraint "bundle_environment_name_foreign";');

    this.addSql('alter table "group" drop constraint "group_environment_name_foreign";');

    this.addSql('alter table "node" drop constraint "node_environment_name_foreign";');

    this.addSql('alter table "bundle" drop constraint "bundle_bundle_name_foreign";');

    this.addSql('alter table "group" drop constraint "group_bundle_name_foreign";');

    this.addSql('alter table "bundle_grpacks" drop constraint "bundle_grpacks_bundle_name_foreign";');

    this.addSql('alter table "node" drop constraint "node_bundle_name_foreign";');

    this.addSql('alter table "group_grpacks" drop constraint "group_grpacks_group_name_foreign";');

    this.addSql('alter table "node" drop constraint "node_group_name_foreign";');

    this.addSql('alter table "group_grpacks" drop constraint "group_grpacks_grpack_name_foreign";');

    this.addSql('alter table "bundle_grpacks" drop constraint "bundle_grpacks_grpack_name_foreign";');

    this.addSql('alter table "node_grpacks" drop constraint "node_grpacks_grpack_name_foreign";');

    this.addSql('alter table "package" drop constraint "package_grpack_name_foreign";');

    this.addSql('alter table "node_grpacks" drop constraint "node_grpacks_node_name_foreign";');

    this.addSql('alter table "package" drop constraint "package_os_os_name_foreign";');

    this.addSql('drop table if exists "environment" cascade;');

    this.addSql('drop table if exists "bundle" cascade;');

    this.addSql('drop table if exists "group" cascade;');

    this.addSql('drop table if exists "grpack" cascade;');

    this.addSql('drop table if exists "group_grpacks" cascade;');

    this.addSql('drop table if exists "bundle_grpacks" cascade;');

    this.addSql('drop table if exists "node" cascade;');

    this.addSql('drop table if exists "node_grpacks" cascade;');

    this.addSql('drop table if exists "os" cascade;');

    this.addSql('drop table if exists "package" cascade;');
  }

}
