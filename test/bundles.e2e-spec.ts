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

      //-----------------------NAME----------------------------------------------------------------------------------------------------------------

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

      //-----------------------GRPACKS----------------------------------------------------------------------------------------------------------------

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

      it('should not update the grpack list (wrong type : number)', () => {
        const updateBundleDto = {
          grpacks: [1, 2, 3],
        };
        return request(app.getHttpServer())
          .patch(BUNDLE_ENDPOINT + '/' + createBundleDto1.name)
          .set('Accept', 'application/json')
          .send(updateBundleDto)
          .expect(400);
      });

      it('should persist the grpack list updated with an empty grpack list', async () => {
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

      //-----------------------BUNDLE----------------------------------------------------------------------------------------------------------------

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
});
