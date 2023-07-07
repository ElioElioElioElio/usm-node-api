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
});
