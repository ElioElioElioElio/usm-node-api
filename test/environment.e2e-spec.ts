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
});
