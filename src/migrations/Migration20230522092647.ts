import { Migration } from '@mikro-orm/migrations';

export class Migration20230522092647 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "package" drop constraint "package_os_os_name_os_verson_foreign";');

    this.addSql('alter table "os" drop constraint "os_pkey";');
    this.addSql('alter table "os" rename column "verson" to "version";');
    this.addSql('alter table "os" add constraint "os_pkey" primary key ("os_name", "version");');

    this.addSql('alter table "package" drop constraint "package_pkey";');
    this.addSql('alter table "package" rename column "os_verson" to "os_version";');
    this.addSql('alter table "package" add constraint "package_os_os_name_os_version_foreign" foreign key ("os_os_name", "os_version") references "os" ("os_name", "version") on update cascade;');
    this.addSql('alter table "package" add constraint "package_pkey" primary key ("os_os_name", "os_version", "package_data_package_name", "package_data_version");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "package" drop constraint "package_os_os_name_os_version_foreign";');

    this.addSql('alter table "os" drop constraint "os_pkey";');
    this.addSql('alter table "os" rename column "version" to "verson";');
    this.addSql('alter table "os" add constraint "os_pkey" primary key ("os_name", "verson");');

    this.addSql('alter table "package" drop constraint "package_pkey";');
    this.addSql('alter table "package" rename column "os_version" to "os_verson";');
    this.addSql('alter table "package" add constraint "package_os_os_name_os_verson_foreign" foreign key ("os_os_name", "os_verson") references "os" ("os_name", "verson") on update cascade;');
    this.addSql('alter table "package" add constraint "package_pkey" primary key ("os_os_name", "os_verson", "package_data_package_name", "package_data_version");');
  }

}
