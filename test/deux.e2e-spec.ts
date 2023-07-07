import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { CreateEnvironmentDto } from '../src/environment/dto/environments/create-environment.dto';
import { UpdateEnvironmentDto } from '../src/environment/dto/environments/update-environment.dto';
import * as path from 'path';
import * as request from 'supertest';
import { GrpackSeeder } from '../src/seeders/GrpackSeeder';
import { CreateBundleDto } from '../src/bundle/dto/rename-bundle.dto';
import { CreateNodeDto } from '../src/node/dto/create-node.dto';
import { OneEnvironmentSeeder } from '../src/seeders/OneEnvironmentSeeder';
import { CreateGroupDto } from '../src/group/dto/create-group.dto';
import { getRandomInt } from '../src/shared/miscellaneous/functions/getRandomInt';
import { UpdateBundleDto } from '../src/bundle/dto/update-bundle.dto';
import { Bundle } from '../src/bundle/entities/bundle.entity';
import { UpdateNodeDto } from '../src/node/dto/update-node.dto';
import { Environment } from '../src/environment/entities/environment.entity';
import { Group } from '../src/group/entities/group.entity';

const OS_ENDPOINT = '/os';
const GRPACK_ENDPOINT = '/grpack';
const ENVIRONMENT_ENDPOINT = '/environment';

describe('Envrionment E2E Tests', () => {
  let app: INestApplication;
  let grpackList;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          type: 'postgresql',
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'example',
          dbName: 'testNodeUsmApi',
          seeder: {
            pathTs: '../src/seeders',
            defaultSeeder: 'GrpackSeeder',
            glob: '!(*.d).{js,ts}',
            emit: 'ts',
            fileName: (className: string) => className,
          },
          entities: ['dist/**/*.entity.js'],
          entitiesTs: ['src/**/*.entity.ts'],
          metadataProvider: TsMorphMetadataProvider,
          migrations: {
            path: path.join(__dirname, './migrations'),
            glob: '!(*.d).{js,ts}',
          },
        }),
        AppModule,
      ],
    }).compile();

    const orm = await MikroORM.init<PostgreSqlDriver>({
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'example',
      dbName: 'testNodeUsmApi',
      seeder: {
        pathTs: '../src/seeders',
        defaultSeeder: 'GrpackSeeder',
        glob: '!(*.d).{js,ts}',
        emit: 'ts',
        fileName: (className: string) => className,
      },
      entities: ['dist/**/*.entity.js'],
      entitiesTs: ['src/**/*.entity.ts'],
      metadataProvider: TsMorphMetadataProvider,
      migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}',
      },
    });
    await orm.getSchemaGenerator().refreshDatabase();

    const seeder = orm.getSeeder();

    await seeder.seed(GrpackSeeder);

    await orm.close();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    await request(app.getHttpServer())
      .get('/grpack')
      .then((response) => {
        grpackList = response.body;
      });
  });

  afterEach(async () => {
    // Close connection
    app.close();
  });

  describe('/environment endpoint tests', () => {
    const createEnvironmentDto1 = {
      name: 'environmentName1',
    } as CreateEnvironmentDto;

    let grpacks;

    describe('CREATE', () => {
      it('should create succesfuly a new environment', () => {
        return request(app.getHttpServer())
          .post(ENVIRONMENT_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createEnvironmentDto1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, nodes, groups, bundles } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof nodes).toBe('object');
            expect(typeof groups).toBe('object');
            expect(typeof bundles).toBe('object');

            expect(name).toEqual(createEnvironmentDto1.name);
            expect(nodes).toEqual([]);
            expect(groups).toEqual([]);
            expect(bundles).toEqual([]);
          });
      });

      it('should persist a created environment', async () => {
        await request(app.getHttpServer())
          .post(ENVIRONMENT_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createEnvironmentDto1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, nodes, groups, bundles } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof nodes).toBe('object');
            expect(typeof groups).toBe('object');
            expect(typeof bundles).toBe('object');

            expect(name).toEqual(createEnvironmentDto1.name);
            expect(nodes).toEqual([]);
            expect(groups).toEqual([]);
            expect(bundles).toEqual([]);
          });

        return request(app.getHttpServer())
          .get(ENVIRONMENT_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createEnvironmentDto1)
          .expect(200)
          .expect((response: request.Response) => {
            const [{ name, nodes, groups, bundles }] = response.body;

            expect(typeof name).toBe('string');
            expect(typeof nodes).toBe('object');
            expect(typeof groups).toBe('object');
            expect(typeof bundles).toBe('object');

            expect(name).toEqual(createEnvironmentDto1.name);
            expect(nodes).toEqual([]);
            expect(groups).toEqual([]);
            expect(bundles).toEqual([]);
          });
      });
    });

    describe('READ', () => {
      /*
      beforeAll(async () => {
        await request(app.getHttpServer())
          .post(ENV_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createEnvironmentDto1);
      });

      it('should read the list of environment'){}
      */
    });

    describe('UPDATE', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(ENVIRONMENT_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createEnvironmentDto1);
      });

      it('should update the environment name', async () => {
        const updateEnvironmentDto = {
          name: 'newName',
        } as UpdateEnvironmentDto;

        await request(app.getHttpServer())
          .patch(ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto1.name)
          .set('Accept', 'application/json')
          .send(updateEnvironmentDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, nodes, groups, bundles } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof nodes).toBe('object');
            expect(typeof groups).toBe('object');
            expect(typeof bundles).toBe('object');

            expect(name).toEqual(updateEnvironmentDto.name);
            expect(nodes).toEqual([]);
            expect(groups).toEqual([]);
            expect(bundles).toEqual([]);
          });
      });
      it('should not update the environment name (null value) and respond Http Code 200', async () => {
        const updateEnvironmentDto = {
          name: null,
        } as UpdateEnvironmentDto;

        await request(app.getHttpServer())
          .patch(ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto1.name)
          .set('Accept', 'application/json')
          .send(updateEnvironmentDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, nodes, groups, bundles } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof nodes).toBe('object');
            expect(typeof groups).toBe('object');
            expect(typeof bundles).toBe('object');

            expect(name).toEqual(createEnvironmentDto1.name);
            expect(nodes).toEqual([]);
            expect(groups).toEqual([]);
            expect(bundles).toEqual([]);
          });
      });

      it('should not update the environment name (undefined value) and respond Http Code 200', async () => {
        const updateEnvironmentDto = {
          name: undefined,
        } as UpdateEnvironmentDto;

        await request(app.getHttpServer())
          .patch(ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto1.name)
          .set('Accept', 'application/json')
          .send(updateEnvironmentDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, nodes, groups, bundles } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof nodes).toBe('object');
            expect(typeof groups).toBe('object');
            expect(typeof bundles).toBe('object');

            expect(name).toEqual(createEnvironmentDto1.name);
            expect(nodes).toEqual([]);
            expect(groups).toEqual([]);
            expect(bundles).toEqual([]);
          });
      });

      it('should not update the environment name (wrong type) and respond Http Code 400', async () => {
        const updateEnvironmentDto = {
          name: 3,
        };

        await request(app.getHttpServer())
          .patch(ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto1.name)
          .set('Accept', 'application/json')
          .send(updateEnvironmentDto)
          .expect(400);
      });
    });

    describe('DELETE', () => {});
  });

  describe('/environment/{id_environment}/bundles endpoint tests', () => {
    let grpackNamesSubList = [];

    const createEnvironmentDto = {
      name: 'environmentName',
    } as CreateEnvironmentDto;

    const BUNDLE_ENDPOINT =
      ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto.name + '/bundles';

    beforeEach(async () => {
      // We get all grpacks names
      grpackNamesSubList = [];
      grpackList.forEach((grpack) => {
        grpackNamesSubList.push(grpack.name);
      });

      // We create an environment
      await request(app.getHttpServer())
        .post(ENVIRONMENT_ENDPOINT)
        .set('Accept', 'application/json')
        .send(createEnvironmentDto);
    });

    describe('CREATE', () => {
      it('should create a bundle providing just its name', async () => {
        const createBundleDto1 = { name: 'bundleName1' } as CreateBundleDto;

        return request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');

            expect(name).toEqual(createBundleDto1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
          });
      });

      it('should persist a bundle created just by providing its name', async () => {
        const createBundleDto1 = { name: 'bundleName1' } as CreateBundleDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(createBundleDto1)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof bundle).toBe('object');

            expect(name).toEqual(createBundleDto1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(bundle).toEqual(null);
          });
      });

      it('should create a bundle providing its name and another bundle', async () => {
        const createBundleDto1 = { name: 'bundleName1' } as CreateBundleDto;
        const createBundleDto2 = {
          name: 'bundleName2',
          bundle: createBundleDto1.name,
        } as CreateBundleDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto2)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createBundleDto2.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(bundle).toEqual(createBundleDto2.bundle);
          });
      });

      it('should persist a created bundle by providing its name and another bundle', async () => {
        const createBundleDto1 = { name: 'bundleName1' } as CreateBundleDto;
        const createBundleDto2 = {
          name: 'bundleName2',
          bundle: createBundleDto1.name,
        } as CreateBundleDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto2);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto2.name)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createBundleDto2.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(bundle).toEqual(createBundleDto1.name);
          });
      });

      it('should not create a bundle providing its name and a non existing bundle', async () => {
        const createBundleDto1 = {
          name: 'bundleName2',
          bundle: 'anything',
        } as CreateBundleDto;

        return request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1)
          .expect(404);
      });

      it('should not persist a bundle created by providing its name and a non existing bundle', async () => {
        const createBundleDto1 = {
          name: 'bundleName2',
          bundle: 'anything',
        } as CreateBundleDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1)
          .expect(404);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .expect(404);
      });

      it('should not create a bundle providing its name and and a list composed of 2 existing grpack and one non existing', async () => {
        const tmp = grpackNamesSubList.slice(0, 2);
        tmp.push('anything');

        const createBundleDto1 = {
          name: 'bundleName2',
          grpacks: tmp,
        } as CreateBundleDto;

        return request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1)
          .expect(404);
      });

      it('should not persist a bundle created by providing its name and and a list composed by one non existing grpack', async () => {
        const createBundleDto1 = {
          name: 'bundleName2',
          grpacks: ['anything'],
        } as CreateBundleDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1)
          .expect(404);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .expect(404);
      });

      it('should create a bundle providing its name, another bundle and multiple GrPacks', async () => {
        const createBundleDto1 = { name: 'bundleName1' } as CreateBundleDto;
        const createBundleDto2 = {
          name: 'bundleName2',
          bundle: createBundleDto1.name,
        } as CreateBundleDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto2)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createBundleDto2.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(bundle).toEqual(createBundleDto2.bundle);
          });
      });

      it('should persist a bundle created by providing its name, another bundle and multiple GrPacks', async () => {
        const subListOfGrpack = grpackNamesSubList.slice(0, 10);

        const createBundleDto1 = { name: 'bundleName1' } as CreateBundleDto;
        const createBundleDto2 = {
          name: 'bundleName2',
          bundle: createBundleDto1.name,
          grpacks: subListOfGrpack,
        } as CreateBundleDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto2);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto2.name)
          .set('Accept', 'application/json')
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            for (let i = 0; i < createBundleDto2.grpacks.length; i++) {
              expect(typeof grpacks[i]).toBe('string');
            }
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createBundleDto2.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            for (let i = 0; i < createBundleDto2.grpacks.length; i++) {
              const grpackName = createBundleDto2.grpacks[i];
              expect(grpacks[i]).toBe(grpackName);
            }
            expect(bundle).toEqual(createBundleDto2.bundle);
          });
      });

      it('should create a bundle providing its name and a list of existing grpack', async () => {
        const subListOfGrpack = grpackNamesSubList.slice(0, 10);

        const createBundleDto1 = {
          name: 'bundleName1',
          grpacks: subListOfGrpack,
        } as CreateBundleDto;

        return request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundles } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundles).toBe('undefined');
            for (let i = 0; i < createBundleDto1.grpacks.length; i++) {
              expect(typeof grpacks[i]).toBe('string');
            }

            expect(name).toEqual(createBundleDto1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            for (let i = 0; i < createBundleDto1.grpacks.length; i++) {
              const grpackName = createBundleDto1.grpacks[i];
              expect(grpacks[i]).toBe(grpackName);
            }
          });
      });

      it('should persist a bundle created by providing its name and a list of existing grpack', async () => {
        const subListOfGrpack = grpackNamesSubList.slice(0, 10);

        const createBundleDto1 = {
          name: 'bundleName1',
          grpacks: subListOfGrpack,
        } as CreateBundleDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundles } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundles).toBe('undefined');
            for (let i = 0; i < createBundleDto1.grpacks.length; i++) {
              expect(typeof grpacks[i]).toBe('string');
            }

            expect(name).toEqual(createBundleDto1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            for (let i = 0; i < createBundleDto1.grpacks.length; i++) {
              const grpackName = createBundleDto1.grpacks[i];
              expect(grpacks[i]).toBe(grpackName);
            }
          });
      });
    });

    describe('READ', () => {});

    describe('UPDATE', () => {
      const BUNDLE_ENDPOINT =
        ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto.name + '/bundles';
      const subListOfGrpack = grpackNamesSubList.slice(0, 10);

      const createBundleDto1 = {
        name: 'bundleName1',
        grpacks: subListOfGrpack,
      } as CreateBundleDto;

      const createOtherBundleDto = {
        name: 'bundlebundlebundle',
        grpacks: grpackNamesSubList.slice(40, 50),
        bundle: null,
      } as CreateBundleDto;

      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createOtherBundleDto);
      });

      it('should update the bundle name', () => {
        const updateBundleDto = { name: 'newName' } as UpdateBundleDto;
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(updateBundleDto.name);
          });
      });

      it('should persist the bundle name updated', async () => {
        const updateBundleDto = { name: 'newName' } as UpdateBundleDto;
        await request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + updateBundleDto.name)
          .set('Accept', 'application/json')
          .expect(200)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(updateBundleDto.name);
          });
      });

      it('should not find the bundle name updated with its old name', async () => {
        const updateBundleDto = { name: 'newName' } as UpdateBundleDto;
        await request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .expect(404);
      });

      it('should not update the bundle name (wrong type: number) and respond Http error 400', () => {
        const updateBundleDto = { name: 0 };
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(400);
      });

      it('should not update the bundle name (wrong type: number) and respond error 400', () => {
        const updateBundleDto = { name: 0 };
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(400);
      });

      it('should not update the bundle name (null value) and respond OK (Optional decorator -> null are ignored)', () => {
        const updateBundleDto = { name: null };
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(createBundleDto1.name);
          });
      });

      it('should update the bundle grpack list by a list of existing grpack', () => {
        const updateBundleDto = {
          grpacks: grpackNamesSubList.slice(10, 20),
        } as UpdateBundleDto;
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { grpacks } = response.body;

            (grpacks as [string]).forEach((grpack) => {
              expect(typeof grpack).toBe('string');
            });

            for (let i = 0; i < updateBundleDto.grpacks.length; i++) {
              const grpackName = updateBundleDto.grpacks[i];
              expect((grpacks as [string])[i]).toEqual(grpackName);
            }
          });
      });

      it('should update the bundle grpack list by a list of grpack with a non existing grpack', () => {
        const tmp = grpackNamesSubList.slice(10, 20);
        tmp.push('anything');

        const updateBundleDto = {
          grpacks: tmp,
        } as UpdateBundleDto;
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(404);
      });

      it('should update the bundle grpack list (empty list)', () => {
        const updateBundleDto = {
          grpacks: [],
        };
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { grpacks } = response.body;

            expect(typeof grpacks).toBe('object');
            expect(grpacks).toEqual([]);
          });
      });

      it('should not update the bundle grpack list (wrong type : number)', () => {
        const updateBundleDto = {
          grpacks: [1, 2, 3],
        };
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(400);
      });

      it('should persist the bundle updated with an empty grpack list', async () => {
        const updateBundleDto = {
          grpacks: [],
        };

        undefined;

        await request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto);

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { grpacks } = response.body;

            expect(typeof grpacks).toBe('object');
            expect(grpacks).toEqual([]);
          });
      });

      it('should update the bundle by an existing one', () => {
        const updateBundleDto = {
          bundle: createOtherBundleDto.name,
        } as UpdateBundleDto;

        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { bundle } = response.body;

            expect(typeof bundle).toBe('string');
            expect(bundle).toEqual(updateBundleDto.bundle);
          });
      });

      it('should not update the bundle by a non existing one', () => {
        const updateBundleDto = {
          bundle: 'anything',
        } as UpdateBundleDto;
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(404);
      });

      it('should update the bundle by a null value', () => {
        const updateBundleDto = {
          bundle: null,
        } as UpdateBundleDto;

        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { bundle } = response.body;

            expect(typeof bundle).toBe('object');
            expect(bundle).toEqual(null);
          });
      });

      it('should not update the bundle by a number', () => {
        const updateBundleDto = {
          bundle: 5,
        };

        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(400);
      });

      it('should not update the bundle by an undefined value (undefined ignore -> Optional decorator -> no modification)', () => {
        const updateBundleDto = {
          bundle: undefined,
        };

        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createOtherBundleDto.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(name).toEqual(createOtherBundleDto.name);

            expect(typeof environment).toBe('string');
            expect(environment).toEqual(createEnvironmentDto.name);

            (grpacks as [string]).forEach((grpack) => {
              expect(typeof grpack).toBe('string');
            });

            for (let i = 0; i < createOtherBundleDto.grpacks.length; i++) {
              const grpackName = createOtherBundleDto.grpacks[i];
              expect((grpacks as [string])[i]).toEqual(grpackName);
            }

            expect(typeof bundle).toBe('object');
            expect(bundle).toEqual(createOtherBundleDto.bundle);
          });
      });
    });

    describe('DELETE', () => {
      const BUNDLE_ENDPOINT =
        ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto.name + '/bundles';
      const subListOfGrpack = grpackNamesSubList.slice(0, 10);
      const createBundleDto1 = {
        name: 'bundleName1',
        grpacks: subListOfGrpack,
      } as CreateBundleDto;
      const createOtherBundleDto = {
        name: 'bundlebundlebundle',
        grpacks: grpackNamesSubList.slice(40, 50),
        bundle: null,
      } as CreateBundleDto;

      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createOtherBundleDto);
      });

      it('should delete an existing bundle', () => {
        return request(app.getHttpServer())
          .delete(BUNDLE_ENDPOINT + '/' + createOtherBundleDto.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200);
      });

      it('should set to null an included bundle deleted', async () => {
        await request(app.getHttpServer())
          .delete(BUNDLE_ENDPOINT + '/' + createOtherBundleDto.name)
          .set('Accept', 'application/json')
          .send();

        return request(app.getHttpServer())
          .get(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send()
          .expect((response: request.Response) => {
            const { bundle } = response.body;

            expect(typeof bundle).toBe('object');

            expect(bundle).toEqual(null);
          });
      });

      it('should respond an 404 Http error deleting a non existing bundle', () => {
        return request(app.getHttpServer())
          .delete(BUNDLE_ENDPOINT + '/anything')
          .set('Accept', 'application/json')
          .send()
          .expect(404);
      });
    });
  });

  describe('/environment/{id_environment}/nodes endpoint tests', () => {
    let grpackNamesSubList = [];

    const createEnvironmentDto = {
      name: 'environmentName',
    } as CreateEnvironmentDto;

    beforeEach(async () => {
      // We get all grpacks names
      grpackNamesSubList = [];
      grpackList.forEach((grpack) => {
        grpackNamesSubList.push(grpack.name);
      });

      // We create an environment
      await request(app.getHttpServer())
        .post(ENVIRONMENT_ENDPOINT)
        .set('Accept', 'application/json')
        .send(createEnvironmentDto);
    });

    describe('CREATE', () => {
      const NODE_ENDPOINT =
        ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto.name + '/nodes';
      const BUNDLE_ENDPOINT =
        ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto.name + '/bundles';

      it('should create a node just by providing its name', () => {
        const createNode1 = { name: 'nodeName' };

        return request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('undefined');
            expect(typeof bundle).toBe('undefined');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
          });
      });

      it('should not create a node just by providing nothing', () => {
        const createNode1 = {};

        return request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(400);
      });

      it('should persist a node created by providing its name', async () => {
        const createNode1 = { name: 'nodeName' };

        await request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('object');
            expect(typeof bundle).toBe('object');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(group).toBe(null);
            expect(bundle).toBe(null);
          });
      });

      it('should create a node by providing its name and a bundle', async () => {
        const subListOfGrpack = grpackNamesSubList.slice(0, 10);

        const createBundleDto1 = {
          name: 'bundleName1',
          grpacks: subListOfGrpack,
        } as CreateBundleDto;

        const createNode1 = {
          name: 'nodeName',
          bundle: createBundleDto1.name,
        } as CreateNodeDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('undefined');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(bundle).toBe(createNode1.bundle);
          });
      });

      it('should create a node by providing its name and a null bundle resulting in a node without bundle', async () => {
        const subListOfGrpack = grpackNamesSubList.slice(0, 10);

        const createBundleDto1 = {
          name: 'bundleName1',
          grpacks: subListOfGrpack,
        } as CreateBundleDto;

        const createNode1 = {
          name: 'nodeName',
          bundle: null,
        } as CreateNodeDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('undefined');
            expect(typeof bundle).toBe('undefined');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(bundle).toBe(undefined);
          });
      });

      it('should not create a node by providing its name and a wrong typed bundle (number)', async () => {
        const subListOfGrpack = grpackNamesSubList.slice(0, 10);

        const createBundleDto1 = {
          name: 'bundleName1',
          grpacks: subListOfGrpack,
        } as CreateBundleDto;

        const createNode1 = {
          name: 'nodeName',
          bundle: 2,
        };

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(400);
      });

      it('should persist a node created by providing its name and a bundle', async () => {
        const createNode1 = { name: 'nodeName' };

        await request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('object');
            expect(typeof bundle).toBe('object');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(group).toBe(null);
            expect(bundle).toBe(null);
          });
      });

      it('should create a node by providing its name, multiple grpack and a bundle', async () => {
        const subListOfGrpack1 = grpackNamesSubList.slice(0, 10);
        const subListOfGrpack2 = grpackNamesSubList.slice(0, 5);

        const createBundleDto1 = {
          name: 'bundleName1',
          grpacks: subListOfGrpack1,
        } as CreateBundleDto;

        const createNode1 = {
          name: 'nodeName',
          bundle: createBundleDto1.name,
          grpacks: subListOfGrpack2,
        } as CreateNodeDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('undefined');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual(subListOfGrpack2);
            expect(bundle).toBe(createNode1.bundle);
          });
      });

      it('should create a node by providing its name, null value as the grpack list and a bundle resulting in a node with a name and a bundle, but no grpakcs', async () => {
        const subListOfGrpack1 = grpackNamesSubList.slice(0, 10);
        const subListOfGrpack2 = grpackNamesSubList.slice(0, 5);

        const createBundleDto1 = {
          name: 'bundleName1',
          grpacks: subListOfGrpack1,
        } as CreateBundleDto;

        const createNode1 = {
          name: 'nodeName',
          bundle: createBundleDto1.name,
          grpacks: null,
        } as CreateNodeDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        return request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('undefined');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(group).toBe(undefined);
            expect(bundle).toBe(createNode1.bundle);
          });
      });

      /*
      it('should persist a node created by providing its name, multiple grpack and a bundle', async () => {
        const createNode1 = { name: 'nodeName' };

        await request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(createNode1)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('object');
            expect(typeof bundle).toBe('object');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(createEnvironmentDto.name);
            expect(grpacks).toEqual([]);
            expect(group).toBe(null);
            expect(bundle).toBe(null);
          });
      });
      */
    });

    describe('READ', () => {});

    describe('UPDATE', () => {
      let NODE_ENDPOINT;
      let BUNDLE_ENDPOINT;

      let envCreated: string;
      let nodesCreated: string[];
      let groupsCreated: string[];
      let bundlesCreated: string[];

      let createNode1: CreateNodeDto;

      beforeEach(async () => {
        //----------------------------------------------------- Database Seeding (Environment + Node + Grpack)
        const orm = await MikroORM.init<PostgreSqlDriver>({
          type: 'postgresql',
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'example',
          dbName: 'testNodeUsmApi',
          seeder: {
            pathTs: '../src/seeders',
            defaultSeeder: 'GrpackSeeder',
            glob: '!(*.d).{js,ts}',
            emit: 'ts',
            fileName: (className: string) => className,
          },
          entities: ['dist/**/*.entity.js'],
          entitiesTs: ['src/**/*.entity.ts'],
          metadataProvider: TsMorphMetadataProvider,
          migrations: {
            path: path.join(__dirname, './migrations'),
            glob: '!(*.d).{js,ts}',
          },
        });
        await orm.getSchemaGenerator().refreshDatabase();
        const seeder = orm.getSeeder();
        await seeder.seed(OneEnvironmentSeeder);
        await orm.close();

        await request(app.getHttpServer())
          .get(ENVIRONMENT_ENDPOINT)
          .set('Accept', 'application/json')
          .then((response) => {
            envCreated = response.body[0].name;
            nodesCreated = response.body[0].nodes;
            groupsCreated = response.body[0].groups;
            bundlesCreated = response.body[0].bundles;

            NODE_ENDPOINT = ENVIRONMENT_ENDPOINT + '/' + envCreated + '/nodes';
            BUNDLE_ENDPOINT =
              ENVIRONMENT_ENDPOINT + '/' + envCreated + '/bundles';
          });

        await request(app.getHttpServer())
          .get('/grpack')
          .then((response) => {
            grpackList = response.body;
          });

        grpackNamesSubList = [];
        grpackList.forEach((grpack) => {
          grpackNamesSubList.push(grpack.name);
        });

        const subListOfGrpack1 = grpackNamesSubList.slice(0, 10);
        const subListOfGrpack2 = grpackNamesSubList.slice(0, 5);

        const createBundleDto1 = {
          name: 'bundleName2',
          grpacks: subListOfGrpack1,
        } as CreateBundleDto;

        createNode1 = {
          name: 'nodeName',
          bundle: createBundleDto1.name,
          grpacks: subListOfGrpack2,
          group: groupsCreated[0],
        } as CreateNodeDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        await request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1);
      });

      //----------------------Name-----------------------------------------------------------------------

      it('should update the name (expected value type)', () => {
        const updateNodeDto = { name: 'newName' } as UpdateNodeDto;
        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(updateNodeDto.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should persist the name update (expected value type)', async () => {
        const updateNodeDto = { name: 'newName' } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(updateNodeDto.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + updateNodeDto.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(updateNodeDto.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the name (wrong value type : number) and respond Http error 400', () => {
        const updateNodeDto = { name: 1 };
        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persit the name update (wrong value type : number) and respond Http error 400', async () => {
        const updateNodeDto = { name: 1 };
        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the name (wrong value type : object) and respond Http error 400', () => {
        const updateNodeDto = { name: {} };
        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persit the name update (wrong value type : object) and respond Http error 400', async () => {
        const updateNodeDto = { name: {} };
        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the name (wrong value type : array) and respond Http error 400', () => {
        const updateNodeDto = { name: [] };
        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persit the name update (wrong value type : array) and respond Http error 400', async () => {
        const updateNodeDto = { name: [] };
        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the name (wrong value type : null) and ignore any error', () => {
        const updateNodeDto = { name: null } as UpdateNodeDto;
        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the name (wrong value type : null) and ignore any error', async () => {
        const updateNodeDto = { name: null } as UpdateNodeDto;
        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      //----------------------Grpack-List-----------------------------------------------------------------------

      it('should update the grpack list (expected value type : array of existing grpack name)', async () => {
        const updateNodeDto = {
          grpacks: grpackNamesSubList.slice(20, 30),
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(updateNodeDto.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should persit the updated grpack list (expected value type : array of existing grpack name)', async () => {
        const updateNodeDto = {
          grpacks: grpackNamesSubList.slice(20, 30),
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(updateNodeDto.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : array of existing grpack name and one non existing grpack) and respond Http code 400', () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push('anything');

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(404);
      });

      it('should not persist the grpack list update (wrong value type : array of existing grpack name and one non existing grpack)', async () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push('anything');

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : array of existing grpack name and a number) and respond Http code 400', () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push(3);

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the grpack list update (wrong value type : array of existing grpack name and a number)', async () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push(3);

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : array of existing grpack name and a null value) and respond Http code 400', () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push(null);

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the grpack list update (wrong value type : array of existing grpack name and a null value)', async () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push(null);

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : array of existing grpack name and an empty object)', () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push({});

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the grpack list update (wrong value type : array of existing grpack name and an empty object)', async () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push({});

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : array of existing grpack name and an empty array)', () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push([]);

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the grpack list update (wrong value type : array of existing grpack name and an empty array)', async () => {
        const tmp = grpackNamesSubList.slice(20, 30);
        tmp.push([]);

        const updateNodeDto = {
          grpacks: tmp,
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : null value) and should respond Http code 200 ', () => {
        const updateNodeDto = {
          grpacks: null,
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not persist the grpack list update (wrong value type : null value) and should respond Http code 200 ', async () => {
        const updateNodeDto = {
          grpacks: null,
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : undefined value) and should respond Http code 200 ', () => {
        const updateNodeDto = {
          grpacks: undefined,
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not persist the grpack list update (wrong value type : undefined value) and should respond Http code 200 ', async () => {
        const updateNodeDto = {
          grpacks: undefined,
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : number value) and should respond Http code 400 ', () => {
        const updateNodeDto = {
          grpacks: 3,
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the grpack list update (wrong value type : number value) and should respond Http code 200 ', async () => {
        const updateNodeDto = {
          grpacks: 3,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the grpack list (wrong value type : object value) and should respond Http code 400 ', () => {
        const updateNodeDto = {
          grpacks: {},
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the grpack list update (wrong value type : object value) and should respond Http code 200 ', async () => {
        const updateNodeDto = {
          grpacks: {},
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should update the grpack list (expected value type : array value) and should respond Http code 200 ', () => {
        const updateNodeDto = {
          grpacks: [],
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(updateNodeDto.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should persist the grpack list update (wrong value type : array value) and should respond Http code 200 ', async () => {
        const updateNodeDto = {
          grpacks: [],
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(updateNodeDto.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      //----------------------Group-----------------------------------------------------------------------
      it('should update the group (expected value type : an existing group name)', () => {
        const updateNodeDto = {
          group: groupsCreated[2],
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(updateNodeDto.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should persist the group update (expected value type : an existing group name)', async () => {
        const updateNodeDto = {
          group: groupsCreated[2],
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(updateNodeDto.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should update the group (expected value type : null) and respond Http code 200', () => {
        const updateNodeDto = {
          group: null,
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('object');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(updateNodeDto.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should persist the group update (expected value type : null)', async () => {
        const updateNodeDto = {
          group: null,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('object');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(updateNodeDto.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should persist the group update (expected value type : null)', async () => {
        const updateNodeDto = {
          group: null,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('object');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(updateNodeDto.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should persist the group update in the group entity (expected value type : null)', async () => {
        const updateNodeDto = {
          group: null,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200);

        return request(app.getHttpServer())
          .get(
            ENVIRONMENT_ENDPOINT +
              '/' +
              envCreated +
              '/groups/' +
              createNode1.group,
          )
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;
            expect(nodes).not.toContain(createNode1.group);
          });
      });

      it('should not update the group (wrong value type : number) and respond Http code 400', () => {
        const updateNodeDto = {
          group: 3,
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the group update (wrong value type : number)', async () => {
        const updateNodeDto = {
          group: 3,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the group (wrong value type : undefined -> ignored) and respond Http code 200', () => {
        const updateNodeDto = {
          group: undefined,
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not persist the group update (wrong value type : undefined -> ignored)', async () => {
        const updateNodeDto = {
          group: undefined,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the group (wrong value type : array) and respond Http code 400', () => {
        const updateNodeDto = {
          group: [],
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the group update (wrong value type : array)', async () => {
        const updateNodeDto = {
          group: [],
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the group (wrong value type : object) and respond Http code 400', () => {
        const updateNodeDto = {
          group: {},
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the group update (wrong value type : object)', async () => {
        const updateNodeDto = {
          group: {},
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      //----------------------Bundle-----------------------------------------------------------------------
      it('should update the bundle (expected value type : an existing bundle name)', () => {
        const updateNodeDto = {
          bundle: bundlesCreated[0],
        } as UpdateNodeDto;

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(updateNodeDto.bundle);
          });
      });

      it('should persist the bundle update (expected value type : an existing bundle name)', async () => {
        const updateNodeDto = {
          bundle: bundlesCreated[0],
        } as UpdateNodeDto;

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(updateNodeDto.bundle);
          });
      });

      it('should update the bundle (expected value type : null) and respond Http code 200', () => {
        const updateNodeDto = {
          bundle: null,
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('object');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(updateNodeDto.bundle);
          });
      });

      it('should persist the bundle update (expected value type : null)', async () => {
        const updateNodeDto = {
          bundle: null,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('object');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(updateNodeDto.bundle);
          });
      });

      it('should not update the bundle (wrong value type : number) and respond Http code 400', () => {
        const updateNodeDto = {
          bundle: 3,
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the bundle update (wrong value type : number)', async () => {
        const updateNodeDto = {
          bundle: 3,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the bundle (wrong value type : undefined -> ignored) and respond Http code 200', () => {
        const updateNodeDto = {
          bundle: undefined,
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not persist the bundle update (wrong value type : undefined -> ignored)', async () => {
        const updateNodeDto = {
          bundle: undefined,
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the bundle (wrong value type : array) and respond Http code 400', () => {
        const updateNodeDto = {
          bundle: [],
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the bundle update (wrong value type : array)', async () => {
        const updateNodeDto = {
          bundle: [],
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });

      it('should not update the bundle (wrong value type : object) and respond Http code 400', () => {
        const updateNodeDto = {
          bundle: {},
        };

        return request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto)
          .expect(400);
      });

      it('should not persist the bundle update (wrong value type : object)', async () => {
        const updateNodeDto = {
          bundle: {},
        };

        await request(app.getHttpServer())
          .patch(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send(updateNodeDto);

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, group, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof group).toBe('string');
            expect(typeof bundle).toBe('string');

            expect(name).toEqual(createNode1.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual(createNode1.grpacks);
            expect(group).toEqual(createNode1.group);
            expect(bundle).toEqual(createNode1.bundle);
          });
      });
    });

    describe('DELETE', () => {
      let NODE_ENDPOINT;
      let BUNDLE_ENDPOINT;

      let envCreated: string;
      let nodesCreated: string[];
      let groupsCreated: string[];
      let bundlesCreated: string[];

      let createNode1: CreateNodeDto;

      beforeEach(async () => {
        //----------------------------------------------------- Database Seeding (Environment + Node + Grpack)
        const orm = await MikroORM.init<PostgreSqlDriver>({
          type: 'postgresql',
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'example',
          dbName: 'testNodeUsmApi',
          seeder: {
            pathTs: '../src/seeders',
            defaultSeeder: 'GrpackSeeder',
            glob: '!(*.d).{js,ts}',
            emit: 'ts',
            fileName: (className: string) => className,
          },
          entities: ['dist/**/*.entity.js'],
          entitiesTs: ['src/**/*.entity.ts'],
          metadataProvider: TsMorphMetadataProvider,
          migrations: {
            path: path.join(__dirname, './migrations'),
            glob: '!(*.d).{js,ts}',
          },
        });
        await orm.getSchemaGenerator().refreshDatabase();
        const seeder = orm.getSeeder();
        await seeder.seed(OneEnvironmentSeeder);
        await orm.close();

        await request(app.getHttpServer())
          .get(ENVIRONMENT_ENDPOINT)
          .set('Accept', 'application/json')
          .then((response) => {
            envCreated = response.body[0].name;
            nodesCreated = response.body[0].nodes;
            groupsCreated = response.body[0].groups;
            bundlesCreated = response.body[0].bundles;

            NODE_ENDPOINT = ENVIRONMENT_ENDPOINT + '/' + envCreated + '/nodes';
            BUNDLE_ENDPOINT =
              ENVIRONMENT_ENDPOINT + '/' + envCreated + '/bundles';
          });

        await request(app.getHttpServer())
          .get('/grpack')
          .then((response) => {
            grpackList = response.body;
          });

        grpackNamesSubList = [];
        grpackList.forEach((grpack) => {
          grpackNamesSubList.push(grpack.name);
        });

        const subListOfGrpack1 = grpackNamesSubList.slice(0, 10);
        const subListOfGrpack2 = grpackNamesSubList.slice(0, 5);

        const createBundleDto1 = {
          name: 'bundleName2',
          grpacks: subListOfGrpack1,
        } as CreateBundleDto;

        createNode1 = {
          name: 'nodeName',
          bundle: createBundleDto1.name,
          grpacks: subListOfGrpack2,
          group: groupsCreated[0],
        } as CreateNodeDto;

        await request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1);

        await request(app.getHttpServer())
          .post(NODE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createNode1);
      });

      it('should delete an existing node', () => {
        return request(app.getHttpServer())
          .delete(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200);
      });

      it('should persist an existing node deletion in the /nodes endpoint', async () => {
        await request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200);

        await request(app.getHttpServer())
          .delete(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send();

        return request(app.getHttpServer())
          .get(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send()
          .expect(404);
      });

      it('should persist an existing node deletion in the /environment endpoint', async () => {
        await request(app.getHttpServer())
          .get(ENVIRONMENT_ENDPOINT + '/' + envCreated)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;

            expect(nodes).toContain(createNode1.name);
          });

        await request(app.getHttpServer())
          .delete(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send();

        await request(app.getHttpServer())
          .get(ENVIRONMENT_ENDPOINT + '/' + envCreated)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;

            expect(nodes).not.toContain(createNode1.name);
          });
      });

      it('should persist the group to wich the deleted node belonged', async () => {
        await request(app.getHttpServer())
          .get(
            ENVIRONMENT_ENDPOINT +
              '/' +
              envCreated +
              '/groups/' +
              createNode1.group,
          )
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;

            console.log(response.body);

            expect(nodes).toContain(createNode1.name);
          });

        await request(app.getHttpServer())
          .delete(NODE_ENDPOINT + '/' + createNode1.name)
          .set('Accept', 'application/json')
          .send();

        await request(app.getHttpServer())
          .get(
            ENVIRONMENT_ENDPOINT +
              '/' +
              envCreated +
              '/groups/' +
              createNode1.group,
          )
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;

            expect(nodes).not.toContain(createNode1.name);
          });
      });

      it('should not delete an non existing node and respond Http 404 error', () => {
        return request(app.getHttpServer())
          .delete(NODE_ENDPOINT + '/anything')
          .set('Accept', 'application/json')
          .send()
          .expect(404);
      });
    });
  });

  describe('/environment/{id_environment}/groups endpoint tests', () => {
    let envCreated: string;
    let nodesCreated: [string];
    let groupsCreated: [string];
    let bundlesCreated: [string];
    let GROUP_ENDPOINT: string;

    beforeEach(async () => {
      //----------------------------------------------------- Database Seeding (Environment + Node + Grpack)
      const orm = await MikroORM.init<PostgreSqlDriver>({
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'example',
        dbName: 'testNodeUsmApi',
        seeder: {
          pathTs: '../src/seeders',
          defaultSeeder: 'GrpackSeeder',
          glob: '!(*.d).{js,ts}',
          emit: 'ts',
          fileName: (className: string) => className,
        },
        entities: ['dist/**/*.entity.js'],
        entitiesTs: ['src/**/*.entity.ts'],
        metadataProvider: TsMorphMetadataProvider,
        migrations: {
          path: path.join(__dirname, './migrations'),
          glob: '!(*.d).{js,ts}',
        },
      });
      await orm.getSchemaGenerator().refreshDatabase();
      const seeder = orm.getSeeder();
      await seeder.seed(OneEnvironmentSeeder);
      await orm.close();
      //----------------------------------------------------- Get an environment

      await request(app.getHttpServer())
        .get(ENVIRONMENT_ENDPOINT)
        .set('Accept', 'application/json')
        .then((response) => {
          envCreated = response.body[0].name;
          nodesCreated = response.body[0].nodes;
          groupsCreated = response.body[0].groups;
          bundlesCreated = response.body[0].bundles;

          GROUP_ENDPOINT = ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups';
        });

      await request(app.getHttpServer())
        .get('/grpack')
        .then((response) => {
          grpackList = response.body;
        });
    });

    describe('CREATE', () => {
      it('should create a group just by providing its name', () => {
        const createGroup = { name: 'groupName' } as CreateGroupDto;

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroup)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe('undefined');
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(createGroup.name);
            expect(environment).toEqual(envCreated);
            expect(grpacks).toEqual([]);
            expect(nodes).toEqual([]);
          });
      });

      it('should persist a group created just by providing its name', async () => {
        const createGroup = { name: 'groupName' } as CreateGroupDto;

        await request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroup);

        return request(app.getHttpServer())
          .get(GROUP_ENDPOINT + '/' + createGroup.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe('object');
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(createGroup.name);
            expect(environment).toEqual(envCreated);
            expect(bundle).toBe(null);
            expect(grpacks).toEqual([]);
            expect(nodes).toEqual([]);
          });
      });

      it('should  not create a group by providing nothing and respond error Http 400', () => {
        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send({})
          .expect(400);
      });

      it('should create a group by providing its name, and multiple grpacks', () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: grpackSubList,
        } as CreateGroupDto;

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe('undefined');
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(createGroupDto.name);
            expect(environment).toEqual(envCreated);
            expect(bundle).toBe(undefined);
            expect(grpacks).toEqual(createGroupDto.grpacks);
            expect(nodes).toEqual([]);
          });
      });

      it('should persit a group created by providing its name, and multiple grpacks', async () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: grpackSubList,
        } as CreateGroupDto;

        await request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(201);

        return request(app.getHttpServer())
          .get(GROUP_ENDPOINT + '/' + createGroupDto.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe('object');
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(createGroupDto.name);
            expect(environment).toEqual(envCreated);
            expect(bundle).toBe(null);
            expect(grpacks).toEqual(createGroupDto.grpacks);
            expect(nodes).toEqual([]);
          });
      });

      it('should create a group by providing its name and null value as grpacks list', () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: null,
        } as CreateGroupDto;

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe('undefined');
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(createGroupDto.name);
            expect(environment).toEqual(envCreated);
            expect(bundle).toBe(undefined);
            expect(grpacks).toEqual([]);
            expect(nodes).toEqual([]);
          });
      });

      it('should create a group by providing its name and an empty grpacks list', () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: [],
        };

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe('undefined');
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(createGroupDto.name);
            expect(environment).toEqual(envCreated);
            expect(bundle).toBe(undefined);
            expect(grpacks).toEqual([]);
            expect(nodes).toEqual([]);
          });
      });

      it('should not create a group by providing its name, and multiple grpacks including one non existing grpack and respond HTTP error 404', () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        grpackSubList.push('anything');
        const createGroupDto = {
          name: 'groupName',
          grpacks: grpackSubList,
        } as CreateGroupDto;

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(404);
      });

      it('should not create a group by providing its name and a number list as the grpack list and respond error 400', () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: [0],
        };

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(400);
      });

      it('should not create a group by providing its name and a number list as the grpack list and respond error 400', () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: [0],
        };

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(400);
      });

      it('should create a group by providing its name, multiple grpacks, and a bundle', () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: grpackSubList,
          bundle: bundlesCreated[0],
        } as CreateGroupDto;

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(createGroupDto.name);
            expect(environment).toEqual(envCreated);
            expect(bundle).toBe(bundlesCreated[0]);
            expect(grpacks).toEqual(createGroupDto.grpacks);
            expect(nodes).toEqual([]);
          });
      });

      it('should persist a group by providing its name, multiple grpacks, and a bundle', async () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: grpackSubList,
          bundle: bundlesCreated[0],
        } as CreateGroupDto;

        await request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(201);

        return request(app.getHttpServer())
          .get(GROUP_ENDPOINT + '/' + createGroupDto.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe('string');
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(createGroupDto.name);
            expect(environment).toEqual(envCreated);
            expect(bundle).toBe(bundlesCreated[0]);
            expect(grpacks).toEqual(createGroupDto.grpacks);
            expect(nodes).toEqual([]);
          });
      });

      it('should not create a group by providing its name, multiple grpacks, and a non existing bundle', () => {
        //const subListGrpack = grpackList
        //const createGroup = { name: 'groupName', grpacks } as CreateGroupDto;

        const grpackSubList = grpackList
          .map((grpack) => grpack.name)
          .slice(0, getRandomInt(5, 15));

        const createGroupDto = {
          name: 'groupName',
          grpacks: grpackSubList,
          bundle: 'anything',
        } as CreateGroupDto;

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGroupDto)
          .expect(404);
      });
    });

    describe('READ', () => {});

    describe('UPDATE', () => {});

    describe('DELETE', () => {});
  });
});
