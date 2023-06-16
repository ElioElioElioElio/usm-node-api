import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { CreateEnvironmentDto } from '../src/environment/dto/environments/create-environment.dto';
import { UpdateEnvironmentDto } from '../src/environment/dto/environments/update-environment.dto';
import { CreateGrpackDto } from '../src/grpack/dto/grpack/create-grpack.dto';
import { CreatePackageDto } from '../src/grpack/dto/packages/create-package.dto';
import * as path from 'path';
import * as request from 'supertest';
import { GrpackSeeder } from '../src/seeders/GrpackSeeder';
import { CreateBundleDto } from '../src/bundle/dto/rename-bundle.dto';
import exp from 'constants';
import { shuffleArray } from '../src/shared/miscellaneous/functions/shuffleArray';
import { type } from 'os';
import { CreateNodeDto } from '../src/node/dto/create-node.dto';
import { OneEnvironmentSeeder } from '../src/seeders/OneEnvironmentSeeder';
import { Environment } from '../src/environment/entities/environment.entity';
import { CreateGroupDto } from '../src/group/dto/create-group.dto';

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
      const BUNDLE_ENDPOINT =
        ENVIRONMENT_ENDPOINT + '/' + createEnvironmentDto.name + '/bundles';

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
        const createBundleDto1 = {
          name: 'bundleName2',
          bundle: 'anything',
          grpacks: ['anything'],
        } as CreateBundleDto;

        return request(app.getHttpServer())
          .post(BUNDLE_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createBundleDto1)
          .expect(404);
      });

      it('should not persist a bundle created by providing its name and and a list composed one non existing grpack', async () => {
        const createBundleDto1 = {
          name: 'bundleName2',
          bundle: 'anything',
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

      it('should create a bundle providing its name, another bundle and multipleGrPacks', async () => {
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

      it('should persist a bundle created by providing its name, another bundle and multipleGrPacks', async () => {
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

    describe('UPDATE', () => {});

    describe('DELETE', () => {});
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
    });

    describe('READ', () => {});

    describe('UPDATE', () => {});

    describe('DELETE', () => {});
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

            console.log(response.body);

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

        console.log(grpackList);

        return request(app.getHttpServer())
          .post(GROUP_ENDPOINT)
          .set('Accept', 'application/json')
          .send({})
          .expect(400);
      });
    });

    describe('READ', () => {});

    describe('UPDATE', () => {});

    describe('DELETE', () => {});
  });
});
