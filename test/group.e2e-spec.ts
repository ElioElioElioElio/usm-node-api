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
import { Bundle } from '../src/bundle/entities/bundle.entity';
import { UpdateNodeDto } from '../src/node/dto/update-node.dto';
import { Environment } from '../src/environment/entities/environment.entity';
import { Group } from '../src/group/entities/group.entity';
import { UpdateGroupDto } from '../src/group/dto/update-group.dto';
import { NodeService } from '../src/node/node.service';
import { group } from 'console';

const OS_ENDPOINT = '/os';
const GRPACK_ENDPOINT = '/grpack';
const ENVIRONMENT_ENDPOINT = '/environment';

describe('Envrionment E2E Tests', () => {
  let app: INestApplication;
  let grpackList;
  let grpackNamesSubList = [];

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

    await seeder.seed(OneEnvironmentSeeder);

    await orm.close();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    // Close connection
    app.close();
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
          grpackNamesSubList = [];
          grpackList.forEach((grpack) => {
            grpackNamesSubList.push(grpack.name);
          });
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

    describe('UPDATE', () => {
      let groupOG;
      beforeEach(async () => {
        await request(app.getHttpServer())
          .get(
            ENVIRONMENT_ENDPOINT +
              '/' +
              envCreated +
              '/groups/' +
              groupsCreated[0],
          )
          .set('Accept', 'application/json')
          .send()
          .then((response) => {
            groupOG = response.body;
          });
      });

      //-----------------------NAME----------------------------------------------------------------------------------------------------------------

      it('should update the name group (expected value type : string) and respond Http code 200', async () => {
        const updateGroupDto = {
          //bundle : bundlesCreated[0],
          //grpacks: ['anything']
          name: 'newName',
          //nodes: ['anything']
        } as UpdateGroupDto;

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe(typeof groupOG.bundle);
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(updateGroupDto.name);
            expect(environment).toEqual(groupOG.environment);
            expect(bundle).toEqual(groupOG.bundle);
            for (let i = 0; i < groupOG.grpacks.length; i++) {
              const grpackName = groupOG.grpacks[i];
              expect(grpacks).toContain(grpackName);
            }
            for (let i = 0; i < groupOG.nodes.length; i++) {
              const nodeName = groupOG.nodes[i];
              expect(nodes).toContain(nodeName);
            }
          });
      });

      it('should not update the name group (wrong type value : number) and respond Http error code 400', async () => {
        const updateGroupDto = {
          //bundle : bundlesCreated[0],
          //grpacks: ['anything']
          name: 2,
          //nodes: ['anything']
        };

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(400);
      });

      it('should not update the name group (wrong value type : null -> optionale -> property ignored) and respond Http code 200', async () => {
        const updateGroupDto = {
          //bundle : bundlesCreated[0],
          //grpacks: ['anything']
          name: null,
          //nodes: ['anything']
        } as UpdateGroupDto;

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe(typeof groupOG.bundle);
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(groupOG.name);
            expect(environment).toEqual(groupOG.environment);
            expect(bundle).toEqual(groupOG.bundle);
            for (let i = 0; i < groupOG.grpacks.length; i++) {
              const grpackName = groupOG.grpacks[i];
              expect(grpacks).toContain(grpackName);
            }
            for (let i = 0; i < groupOG.nodes.length; i++) {
              const nodeName = groupOG.nodes[i];
              expect(nodes).toContain(nodeName);
            }
          });
      });

      it('should not update the name group (wrong value type : undefined -> optionale -> property ignored) and respond Http code 200', async () => {
        const updateGroupDto = {
          //bundle : bundlesCreated[0],
          //grpacks: ['anything']
          name: undefined,
          //nodes: ['anything']
        } as UpdateGroupDto;

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, bundle, grpacks, nodes } = response.body;

            expect(typeof name).toBe('string');
            expect(typeof environment).toBe('string');
            expect(typeof bundle).toBe(typeof groupOG.bundle);
            expect(typeof grpacks).toBe('object');
            expect(typeof nodes).toBe('object');

            expect(name).toEqual(groupOG.name);
            expect(environment).toEqual(groupOG.environment);
            expect(bundle).toEqual(groupOG.bundle);
            for (let i = 0; i < groupOG.grpacks.length; i++) {
              const grpackName = groupOG.grpacks[i];
              expect(grpacks).toContain(grpackName);
            }
            for (let i = 0; i < groupOG.nodes.length; i++) {
              const nodeName = groupOG.nodes[i];
              expect(nodes).toContain(nodeName);
            }
          });
      });

      it('should not update the name group (wrong type value : object) and respond Http error code 400', async () => {
        const updateGroupDto = {
          //bundle : bundlesCreated[0],
          //grpacks: ['anything']
          name: {},
          //nodes: ['anything']
        };

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(400);
      });

      it('should not update the name group (wrong type value : array) and respond Http error code 400', async () => {
        const updateGroupDto = {
          //bundle : bundlesCreated[0],
          //grpacks: ['anything']
          name: [],
          //nodes: ['anything']
        };

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(400);
      });

      //-----------------------GRPACKS----------------------------------------------------------------------------------------------------------------

      it('should update the grpack list by a list of existing grpack Http Code 200', async () => {
        const updateGroupDto = {
          grpacks: grpackNamesSubList.slice(10, 20),
        } as UpdateGroupDto;

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { grpacks } = response.body;

            (grpacks as [string]).forEach((grpack) => {
              expect(typeof grpack).toBe('string');
            });

            for (let i = 0; i < updateGroupDto.grpacks.length; i++) {
              const grpackName = updateGroupDto.grpacks[i];
              expect((grpacks as [string])[i]).toEqual(grpackName);
            }
          });
      });

      it('should update the grpack list by an empty list and respon Http Code 200', async () => {
        const updateGroupDto = {
          grpacks: [],
        };

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { grpacks } = response.body;

            expect(grpacks).toEqual([]);
          });
      });

      it('should not update the grpack list by a list of grpack with a non existing grpack and respond error 404', () => {
        const tmp = grpackNamesSubList.slice(10, 20);
        tmp.push('anything');

        const updateGroupDto = {
          grpacks: tmp,
        } as UpdateGroupDto;
        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(404);
      });

      it('should update the grpack list (empty list) ', () => {
        const updateGroupDto = {
          grpacks: [],
        };
        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { grpacks } = response.body;

            expect(typeof grpacks).toBe('object');
            expect(grpacks).toEqual([]);
          });
      });

      it('should persist grpack list updated with an empty grpack list', async () => {
        const updateGroupDto = {
          grpacks: [],
        };

        await request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto);

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { grpacks } = response.body;

            expect(typeof grpacks).toBe('object');
            expect(grpacks).toEqual([]);
          });
      });

      it('should not update the grpack list (wrong type : number)', () => {
        const updateGroupDto = {
          grpacks: [1, 2, 3],
        };
        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(400);
      });

      //-----------------------BUNDLE----------------------------------------------------------------------------------------------------------------

      it('should update the bundle by an existing one', () => {
        const updateBundleDto = {
          bundle: bundlesCreated[0],
        } as UpdateGroupDto;

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
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
        } as UpdateGroupDto;

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(404);
      });

      it('should update the bundle by a null value', () => {
        const updateBundleDto = {
          bundle: null,
        } as UpdateGroupDto;

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
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
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(400);
      });

      it('should not update the bundle by an undefined value (undefined ignore -> Optional decorator -> no modification)', () => {
        const updateBundleDto = {
          bundle: undefined,
        };

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name, environment, grpacks, bundle } = response.body;

            expect(typeof name).toBe('string');
            expect(name).toEqual(groupOG.name);

            expect(typeof environment).toBe('string');
            expect(environment).toEqual(groupOG.environment);

            (grpacks as [string]).forEach((grpack) => {
              expect(typeof grpack).toBe('string');
            });

            for (let i = 0; i < groupOG.grpacks.length; i++) {
              const grpackName = groupOG.grpacks[i];
              expect(grpacks).toContain(grpackName);
            }

            expect(typeof bundle).toBe('string');
            expect(bundle).toEqual(groupOG.bundle);
          });
      });

      //-----------------------Nodes----------------------------------------------------------------------------------------------------------------

      it('should update the node list by a list of existing node', async () => {
        const updateGroupDto = {
          nodes: nodesCreated.slice(10, 20),
        } as UpdateGroupDto;

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;

            (nodes as [string]).forEach((grpack) => {
              expect(typeof grpack).toBe('string');
            });

            for (let i = 0; i < updateGroupDto.nodes.length; i++) {
              const nodeName = updateGroupDto.nodes[i];
              expect((nodes as [string])[i]).toEqual(nodeName);
            }
          });
      });

      it('should persist node list updated with a list of existing node', async () => {
        const updateGroupDto = {
          nodes: nodesCreated.slice(10, 20),
        };

        await request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto);

        return request(app.getHttpServer())
          .get(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;

            expect(typeof nodes).toBe('object');
            expect(nodes.length).toEqual(updateGroupDto.nodes.length);
            updateGroupDto.nodes.forEach((element) => {
              expect(nodes).toContain(element);
            });
          });
      });

      it('should update the group of the old nodes of the updated group', async () => {
        const updateGroupDto = {
          nodes: nodesCreated.slice(10, 20),
        };

        await request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto);

        const oldNodes = [];

        for (let i = 0; i < groupOG.nodes.length; i++) {
          const nodeName = groupOG.nodes[i];

          await request(app.getHttpServer())
            .get(ENVIRONMENT_ENDPOINT + '/' + envCreated + '/nodes/' + nodeName)
            .set('Accept', 'application/json')
            .send(updateGroupDto)
            .then((res) => oldNodes.push(res.body));
        }

        oldNodes.forEach((oldNode) => {
          if (!updateGroupDto.nodes.includes(oldNode.name)) {
            expect(oldNode.group).toEqual(null);
          } else {
            expect(oldNode.group).toEqual(groupOG.name);
          }
        });
      });

      it('should persist the group of the old nodes of the updated group', async () => {
        const updateGroupDto = {
          nodes: nodesCreated.slice(10, 20),
        };

        await request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto);

        const oldNodes = [];

        for (let i = 0; i < groupOG.nodes.length; i++) {
          const nodeName = groupOG.nodes[i];

          await request(app.getHttpServer())
            .get(ENVIRONMENT_ENDPOINT + '/' + envCreated + '/nodes/' + nodeName)
            .set('Accept', 'application/json')
            .send(updateGroupDto)
            .then((res) => oldNodes.push(res.body));
        }

        oldNodes.forEach((oldNode) => {
          if (!updateGroupDto.nodes.includes(oldNode.name)) {
            expect(oldNode.group).toEqual(null);
          } else {
            expect(oldNode.group).toEqual(groupOG.name);
          }
        });
      });

      it('should persist the group of the new nodes of the updated group', async () => {
        const updateGroupDto = {
          nodes: nodesCreated.slice(10, 20),
        };

        await request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto);

        const newNodes = [];

        for (let i = 0; i < updateGroupDto.nodes.length; i++) {
          const nodeName = updateGroupDto.nodes[i];

          await request(app.getHttpServer())
            .get(ENVIRONMENT_ENDPOINT + '/' + envCreated + '/nodes/' + nodeName)
            .set('Accept', 'application/json')
            .send(updateGroupDto)
            .then((res) => newNodes.push(res.body));
        }

        newNodes.forEach((newNode) => {
          expect(newNode.group).toEqual(groupOG.name);
        });
      });

      it('should update the node list by an empty list', async () => {
        const updateGroupDto = {
          nodes: [],
        };

        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;

            expect(nodes).toEqual([]);
          });
      });

      it('should persist node list updated with an empty node list', async () => {
        const updateGroupDto = {
          nodes: [],
        };

        await request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto);

        return request(app.getHttpServer())
          .get(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { nodes } = response.body;

            expect(typeof nodes).toBe('object');
            expect(nodes).toEqual([]);
          });
      });

      it('should not update the node list by a list of nodes with a non existing node', () => {
        const tmp = nodesCreated.slice(10, 20);
        tmp.push('anything');

        const updateGroupDto = {
          nodes: tmp,
        } as UpdateGroupDto;
        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(404);
      });

      it('should not update the node list (wrong type : number)', () => {
        const updateGroupDto = {
          grpacks: [1, 2, 3],
        };
        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(400);
      });

      it('should not update the node list (wrong type : object)', () => {
        const updateGroupDto = {
          grpacks: [{}],
        };
        return request(app.getHttpServer())
          .patch(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send(updateGroupDto)
          .expect(400);
      });
    });

    describe('DELETE', () => {
      let groupOG;

      beforeEach(async () => {
        await request(app.getHttpServer())
          .get(
            ENVIRONMENT_ENDPOINT +
              '/' +
              envCreated +
              '/groups/' +
              groupsCreated[0],
          )
          .set('Accept', 'application/json')
          .send()
          .then((response) => {
            groupOG = response.body;
          });
      });

      it('should delete an existing group', () => {
        return request(app.getHttpServer())
          .delete(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send()
          .expect(200);
      });

      it('should persist the group deletion in its environment', async () => {
        await request(app.getHttpServer())
          .delete(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send()
          .expect(200);

        return request(app.getHttpServer())
          .get(ENVIRONMENT_ENDPOINT + '/' + envCreated)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { groups } = response.body;
            expect(groups).not.toContain(groupOG.name);
          });
      });

      it('should persist the group deletion in its nodes included', async () => {
        await request(app.getHttpServer())
          .delete(
            ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/' + groupOG.name,
          )
          .set('Accept', 'application/json')
          .send()
          .expect(200);

        const oldNodes = [];

        for (let i = 0; i < groupOG.nodes.length; i++) {
          const nodeName = groupOG.nodes[i];

          await request(app.getHttpServer())
            .get(ENVIRONMENT_ENDPOINT + '/' + envCreated + '/nodes/' + nodeName)
            .set('Accept', 'application/json')
            .send()
            .then((res) => oldNodes.push(res.body));
        }

        oldNodes.forEach((oldNode) => {
          expect(oldNode.group).toEqual(null);
        });
      });

      it('should not delete a non existing group', () => {
        return request(app.getHttpServer())
          .delete(ENVIRONMENT_ENDPOINT + '/' + envCreated + '/groups/anything')
          .set('Accept', 'application/json')
          .send()
          .expect(404);
      });
    });
  });
});
