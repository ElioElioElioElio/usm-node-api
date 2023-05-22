import { Migration } from '@mikro-orm/migrations';

export class Migration20230522090418 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "environment" ("name" varchar(50) not null, constraint "environment_pkey" primary key ("name"));');

    this.addSql('create table "grpack" ("name" varchar(255) not null, constraint "grpack_pkey" primary key ("name"));');

    this.addSql('create table "grpack_bundle" ("name" varchar(50) not null, "environment_name" varchar(50) null, "grpack_bundle_name" varchar(50) not null, constraint "grpack_bundle_pkey" primary key ("name"));');

    this.addSql('create table "grpack_bundle_grpacks" ("grpack_bundle_name" varchar(50) not null, "grpack_name" varchar(255) not null, constraint "grpack_bundle_grpacks_pkey" primary key ("grpack_bundle_name", "grpack_name"));');

    this.addSql('create table "node_group" ("name" varchar(50) not null, "environment_name" varchar(50) null, constraint "node_group_pkey" primary key ("name"));');

    this.addSql('create table "node_group_grpacks" ("node_group_name" varchar(50) not null, "grpack_name" varchar(255) not null, constraint "node_group_grpacks_pkey" primary key ("node_group_name", "grpack_name"));');

    this.addSql('create table "node" ("name" varchar(50) not null, "environment_name" varchar(50) null, "node_group_name" varchar(50) null, constraint "node_pkey" primary key ("name"));');

    this.addSql('create table "node_grpacks" ("node_name" varchar(50) not null, "grpack_name" varchar(255) not null, constraint "node_grpacks_pkey" primary key ("node_name", "grpack_name"));');

    this.addSql('create table "os" ("os_name" varchar(255) not null, "verson" varchar(255) not null, constraint "os_pkey" primary key ("os_name", "verson"));');

    this.addSql('create table "package_data" ("package_name" varchar(255) not null, "version" varchar(255) not null, constraint "package_data_pkey" primary key ("package_name", "version"));');

    this.addSql('create table "package" ("os_os_name" varchar(255) not null, "os_verson" varchar(255) not null, "package_data_package_name" varchar(255) not null, "package_data_version" varchar(255) not null, "grpack_name" varchar(255) not null, constraint "package_pkey" primary key ("os_os_name", "os_verson", "package_data_package_name", "package_data_version"));');

    this.addSql('alter table "grpack_bundle" add constraint "grpack_bundle_environment_name_foreign" foreign key ("environment_name") references "environment" ("name") on delete cascade;');
    this.addSql('alter table "grpack_bundle" add constraint "grpack_bundle_grpack_bundle_name_foreign" foreign key ("grpack_bundle_name") references "grpack_bundle" ("name") on update cascade;');

    this.addSql('alter table "grpack_bundle_grpacks" add constraint "grpack_bundle_grpacks_grpack_bundle_name_foreign" foreign key ("grpack_bundle_name") references "grpack_bundle" ("name") on update cascade on delete cascade;');
    this.addSql('alter table "grpack_bundle_grpacks" add constraint "grpack_bundle_grpacks_grpack_name_foreign" foreign key ("grpack_name") references "grpack" ("name") on update cascade on delete cascade;');

    this.addSql('alter table "node_group" add constraint "node_group_environment_name_foreign" foreign key ("environment_name") references "environment" ("name") on delete cascade;');

    this.addSql('alter table "node_group_grpacks" add constraint "node_group_grpacks_node_group_name_foreign" foreign key ("node_group_name") references "node_group" ("name") on update cascade on delete cascade;');
    this.addSql('alter table "node_group_grpacks" add constraint "node_group_grpacks_grpack_name_foreign" foreign key ("grpack_name") references "grpack" ("name") on update cascade on delete cascade;');

    this.addSql('alter table "node" add constraint "node_environment_name_foreign" foreign key ("environment_name") references "environment" ("name") on delete cascade;');
    this.addSql('alter table "node" add constraint "node_node_group_name_foreign" foreign key ("node_group_name") references "node_group" ("name") on delete cascade;');

    this.addSql('alter table "node_grpacks" add constraint "node_grpacks_node_name_foreign" foreign key ("node_name") references "node" ("name") on update cascade on delete cascade;');
    this.addSql('alter table "node_grpacks" add constraint "node_grpacks_grpack_name_foreign" foreign key ("grpack_name") references "grpack" ("name") on update cascade on delete cascade;');

    this.addSql('alter table "package" add constraint "package_os_os_name_os_verson_foreign" foreign key ("os_os_name", "os_verson") references "os" ("os_name", "verson") on update cascade;');
    this.addSql('alter table "package" add constraint "package_package_data_package_name_package_data_version_foreign" foreign key ("package_data_package_name", "package_data_version") references "package_data" ("package_name", "version") on update cascade;');
    this.addSql('alter table "package" add constraint "package_grpack_name_foreign" foreign key ("grpack_name") references "grpack" ("name") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "grpack_bundle" drop constraint "grpack_bundle_environment_name_foreign";');

    this.addSql('alter table "node_group" drop constraint "node_group_environment_name_foreign";');

    this.addSql('alter table "node" drop constraint "node_environment_name_foreign";');

    this.addSql('alter table "grpack_bundle_grpacks" drop constraint "grpack_bundle_grpacks_grpack_name_foreign";');

    this.addSql('alter table "node_group_grpacks" drop constraint "node_group_grpacks_grpack_name_foreign";');

    this.addSql('alter table "node_grpacks" drop constraint "node_grpacks_grpack_name_foreign";');

    this.addSql('alter table "package" drop constraint "package_grpack_name_foreign";');

    this.addSql('alter table "grpack_bundle" drop constraint "grpack_bundle_grpack_bundle_name_foreign";');

    this.addSql('alter table "grpack_bundle_grpacks" drop constraint "grpack_bundle_grpacks_grpack_bundle_name_foreign";');

    this.addSql('alter table "node_group_grpacks" drop constraint "node_group_grpacks_node_group_name_foreign";');

    this.addSql('alter table "node" drop constraint "node_node_group_name_foreign";');

    this.addSql('alter table "node_grpacks" drop constraint "node_grpacks_node_name_foreign";');

    this.addSql('alter table "package" drop constraint "package_os_os_name_os_verson_foreign";');

    this.addSql('alter table "package" drop constraint "package_package_data_package_name_package_data_version_foreign";');

    this.addSql('drop table if exists "environment" cascade;');

    this.addSql('drop table if exists "grpack" cascade;');

    this.addSql('drop table if exists "grpack_bundle" cascade;');

    this.addSql('drop table if exists "grpack_bundle_grpacks" cascade;');

    this.addSql('drop table if exists "node_group" cascade;');

    this.addSql('drop table if exists "node_group_grpacks" cascade;');

    this.addSql('drop table if exists "node" cascade;');

    this.addSql('drop table if exists "node_grpacks" cascade;');

    this.addSql('drop table if exists "os" cascade;');

    this.addSql('drop table if exists "package_data" cascade;');

    this.addSql('drop table if exists "package" cascade;');
  }

}
