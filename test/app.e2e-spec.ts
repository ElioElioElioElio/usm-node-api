import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import * as request from 'supertest';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import * as path from 'path';
import { MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { CreateOsDto } from '../src/grpack/dto/os/create-os.dto';
import { AppModule } from '../src/app.module';
import { CreateGrpackDto } from '../src/grpack/dto/grpack/create-grpack.dto';
import { CreatePackageDto } from '../src/grpack/dto/packages/create-package.dto';

const OS_ENDPOINT = '/os';
const GRPACK_ENDPOINT = '/grpack';

describe('GRPACKS E2E TESTS', () => {
  let app: INestApplication;

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
    orm.close();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    // Close connection
    app.close();
  });

  describe('/os endpoint tests', () => {
    const OS_ENDPOINT = '/os';

    describe('CREATE', () => {
      it('Should create a new Os', () => {
        const osDto = { osName: 'name' } as CreateOsDto;

        return request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send(osDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { osName } = response.body;
            expect(typeof osName).toBe('string');
            expect(osName).toEqual(osDto.osName);
          });
      });

      it('Should not create a new Os (null case)', () => {
        return request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send({ osName: null })
          .expect(400);
      });

      it('Should not create a new Os (undefined case)', () => {
        return request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send({ osName: undefined })
          .expect(400);
      });

      it('Should not create a new Os (undefined case)', () => {
        return request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send({ osName: undefined })
          .expect(400);
      });

      it('Should not create a new Os (empty body sent)', () => {
        return request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send()
          .expect(400);
      });

      it('Should not create a new Os (empty JSON sent)', () => {
        return request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send({})
          .expect(400);
      });

      it('Should not create another Os already existing', async () => {
        const osDto = { osName: 'name' } as CreateOsDto;

        await request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send(osDto);

        return request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send(osDto)
          .expect(409);
      });

      it('should have persisted a newly created os', async () => {
        const osDto = { osName: 'name' } as CreateOsDto;

        await request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send(osDto);

        return request(app.getHttpServer())
          .get(OS_ENDPOINT + '/' + osDto.osName)
          .set('Accept', 'application/json')
          .send()
          .expect(200);
      });
    });

    describe('READ', () => {
      const osDto = { osName: 'name' } as CreateOsDto;

      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send(osDto);
      });

      it('should not find a not existing os', () => {
        return request(app.getHttpServer())
          .get(OS_ENDPOINT + '/anything')
          .set('Accept', 'application/json')
          .send()
          .expect(404);
      });

      it('should find an existing os', () => {
        return request(app.getHttpServer())
          .get(OS_ENDPOINT + '/')
          .set('Accept', 'application/json')
          .send()
          .expect((response: request.Response) => {
            expect([osDto]).toEqual(response.body);
          })
          .expect(200);
      });
    });

    describe('UPDATE', () => {
      const osDto = { osName: 'name' } as CreateOsDto;
      const updateOsDto = { osName: 'newName' } as CreateOsDto;

      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send(osDto);
      });

      it('should update an existing os', () => {
        return request(app.getHttpServer())
          .patch(OS_ENDPOINT + '/' + osDto.osName)
          .set('Accept', 'application/json')
          .send(updateOsDto)
          .expect((response: request.Response) => {
            const { osName } = response.body;
            expect(typeof osName).toBe('string');
            expect(osName).toEqual(updateOsDto.osName);
          })
          .expect(200);
      });

      it('should not update a not existing os and respond an error', () => {
        return request(app.getHttpServer())
          .patch(OS_ENDPOINT + '/anything' + osDto.osName)
          .set('Accept', 'application/json')
          .send(updateOsDto)
          .expect(404);
      });

      it('should not update the os (empty DTO) and return the os untouched', () => {
        return request(app.getHttpServer())
          .patch(OS_ENDPOINT + '/' + osDto.osName)
          .set('Accept', 'application/json')
          .send({})
          .expect((response: request.Response) => {
            const { osName } = response.body;
            expect(typeof osName).toBe('string');
            expect(osName).toEqual(osDto.osName);
          })
          .expect(200);
      });

      it('should not update the os (field not existing in dto) and return the os untouched', () => {
        return request(app.getHttpServer())
          .patch(OS_ENDPOINT + '/' + osDto.osName)
          .set('Accept', 'application/json')
          .send({ machin: 'truc' })
          .expect(200)
          .expect((response: request.Response) => {
            const { osName } = response.body;
            expect(typeof osName).toBe('string');
            expect(osName).toEqual(osDto.osName);
          });
      });

      it('should not update the os (property existing and wrong type) and respond an error', () => {
        return request(app.getHttpServer())
          .patch(OS_ENDPOINT + '/' + osDto.osName)
          .set('Accept', 'application/json')
          .send({ osName: 2 })
          .expect(400);
      });

      it('should not update the os (property existing and null value) and return the os untouched', () => {
        return request(app.getHttpServer())
          .patch(OS_ENDPOINT + '/' + osDto.osName)
          .set('Accept', 'application/json')
          .send({ osName: null })
          .expect(200);
      });
    });

    describe('DELETE', () => {});
  });

  describe('/grpacks endpoint tests', () => {
    describe('CREATE', () => {
      it('Should create a new Grpack', () => {
        const createGrpackDto = { name: 'name' } as CreateGrpackDto;

        return request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(createGrpackDto.name);
          });
      });

      it('Should have persisted a newly created Grpack', async () => {
        const createGrpackDto = { name: 'name' } as CreateGrpackDto;

        await request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(createGrpackDto.name);
          });

        return request(app.getHttpServer())
          .get(GRPACK_ENDPOINT + '/' + createGrpackDto.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200);
      });

      it('Should not create a new Grpack (null case)', () => {
        return request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send({ name: null })
          .expect(400);
      });

      it('Should not create a new Grpack (undefined case)', () => {
        return request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send({ name: undefined })
          .expect(400);
      });

      it('Should not create a new Grpack (undefined case)', () => {
        return request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send({ name: undefined })
          .expect(400);
      });

      it('Should not create a new Grpack (empty body sent)', () => {
        return request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send()
          .expect(400);
      });

      it('Should not create a new Grpack (empty JSON sent)', () => {
        return request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send({})
          .expect(400);
      });

      it('Should not create another Grpack already existing', async () => {
        const createGrpackDto = { name: 'name' } as CreateGrpackDto;

        await request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto);

        return request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto)
          .expect(409);
      });
    });

    describe('READ', () => {
      it('Should read all existing grpacks (empty array because no grpack created)', async () => {
        return request(app.getHttpServer())
          .get(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const listOfGrpacks = response.body;
            expect(listOfGrpacks).toStrictEqual([]);
          });
      });

      it('Should read all grpacks', async () => {
        const createGrpackDto = { name: 'name' } as CreateGrpackDto;

        await request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(createGrpackDto.name);
          });

        return request(app.getHttpServer())
          .get(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto)
          .expect(200)
          .expect((response: request.Response) => {
            const listOfGrpacks = response.body;
            expect(typeof listOfGrpacks[0].name).toBe('string');
            expect(listOfGrpacks[0].name).toEqual(createGrpackDto.name);
            expect(listOfGrpacks[0].packages).toStrictEqual({});
          });
      });
    });

    describe('UPDATE', () => {
      const createGrpackDto = { name: 'name' } as CreateGrpackDto;
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(createGrpackDto.name);
          });
      });

      it('should update the grpack', () => {
        const updateGrpackDto = { name: 'newName' } as CreateGrpackDto;

        return request(app.getHttpServer())
          .patch(GRPACK_ENDPOINT + '/' + createGrpackDto.name)
          .set('Accept', 'application/json')
          .send(updateGrpackDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(updateGrpackDto.name);
          });
      });

      it('should not update the grpack (invalid type)', () => {
        const updateGrpackDto = { name: 3 };

        return request(app.getHttpServer())
          .patch(GRPACK_ENDPOINT + '/' + createGrpackDto.name)
          .set('Accept', 'application/json')
          .send(updateGrpackDto)
          .expect(400);
      });

      it('should not have persited changes after an invalid type update', async () => {
        const updateGrpackDto = { name: 3 };

        await request(app.getHttpServer())
          .patch(GRPACK_ENDPOINT + '/' + createGrpackDto.name)
          .set('Accept', 'application/json')
          .send(updateGrpackDto)
          .expect(400);

        return request(app.getHttpServer())
          .get(GRPACK_ENDPOINT + '/' + createGrpackDto.name)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(createGrpackDto.name);
          });
      });

      it('should update the grpack but no change (null value)', () => {
        const updateGrpackDto = { name: null };

        return request(app.getHttpServer())
          .patch(GRPACK_ENDPOINT + '/' + createGrpackDto.name)
          .set('Accept', 'application/json')
          .send(updateGrpackDto)
          .expect(200)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(createGrpackDto.name);
          });
      });
    });

    describe('DELETE', () => {
      const createOsDto = { osName: 'osName' } as CreateOsDto;
      const createGrpackDto = { name: 'grpackName' } as CreateGrpackDto;
      const createPackageDto = {
        os: createOsDto.osName,
        packageName: 'packageName',
        version: 'latest',
      } as CreatePackageDto;

      const PACKAGES_ENDPOINT = '/grpack/' + createGrpackDto.name + '/packages';
      const OS_ENDPOINT = '/os';

      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(OS_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createOsDto);

        await request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto)
          .expect(201)
          .expect((response: request.Response) => {
            const { name } = response.body;
            expect(typeof name).toBe('string');
            expect(name).toEqual(createGrpackDto.name);
          });

        await request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createPackageDto);
      });

      it('should delete an existing grpack and respond the Http code OK', () => {
        return request(app.getHttpServer())
          .delete(GRPACK_ENDPOINT + '/' + createGrpackDto.name)
          .expect(200);
      });

      it('should respond error 404 when attempting to delete a non existing grpack', () => {
        return request(app.getHttpServer())
          .delete(GRPACK_ENDPOINT + '/anything')
          .expect(404);
      });

      it('should delete all related package of a grpack deleted', async () => {
        await request(app.getHttpServer()).delete(
          GRPACK_ENDPOINT + '/' + createGrpackDto.name,
        );

        await request(app.getHttpServer())
          .post(GRPACK_ENDPOINT)
          .set('Accept', 'application/json')
          .send(createGrpackDto);

        return request(app.getHttpServer())
          .get(PACKAGES_ENDPOINT + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(createGrpackDto);
      });
    });
  });

  describe('/grpacks/{id}/packages/ endpoint tests', () => {
    const createOsDto1 = { osName: 'osName1' } as CreateOsDto;
    const createOsDto2 = { osName: 'osName2' } as CreateOsDto;
    const createOsDto3 = { osName: 'osName3' } as CreateOsDto;

    const createGrpack1Dto = { name: 'grpackName1' } as CreateGrpackDto;
    const createGrpack2Dto = { name: 'grpackName2' } as CreateGrpackDto;

    const PACKAGES_ENDPOINT1 = '/grpack/' + createGrpack1Dto.name + '/packages';
    const PACKAGES_ENDPOINT2 = '/grpack/' + createGrpack2Dto.name + '/packages';
    const OS_ENDPOINT = '/os';

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(GRPACK_ENDPOINT)
        .set('Accept', 'application/json')
        .send(createGrpack1Dto);

      await request(app.getHttpServer())
        .post(GRPACK_ENDPOINT)
        .set('Accept', 'application/json')
        .send(createGrpack2Dto);

      await request(app.getHttpServer())
        .post(OS_ENDPOINT)
        .set('Accept', 'application/json')
        .send(createOsDto1);

      await request(app.getHttpServer())
        .post(OS_ENDPOINT)
        .set('Accept', 'application/json')
        .send(createOsDto2);

      await request(app.getHttpServer())
        .post(OS_ENDPOINT)
        .set('Accept', 'application/json')
        .send(createOsDto3);
    });

    describe('CREATE', () => {
      const createPackageDto = {
        os: createOsDto1.osName,
        packageName: 'packageName',
        version: 'latest',
      } as CreatePackageDto;

      it('should create a new package succesfully', () => {
        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto)
          .expect(201)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should create a new package succesfully (1 package for an Os has already been created for a Grpack, we attempt to add a new package for with the same Os for another Grpack )', async () => {
        await request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto);

        return (
          request(app.getHttpServer())
            .post(PACKAGES_ENDPOINT2)
            .set('Accept', 'application/json')
            .send(createPackageDto)
            //.expect(201)
            .expect((response: request.Response) => {
              const pkg = response.body;

              expect(typeof pkg.os.osName).toBe('string');
              expect(typeof pkg.packageName).toBe('string');
              expect(typeof pkg.version).toBe('string');
              expect(typeof pkg.grpack.name).toBe('string');

              expect(pkg.os.osName).toEqual(createOsDto1.osName);
              expect(pkg.packageName).toEqual(createPackageDto.packageName);
              expect(pkg.version).toEqual(createPackageDto.version);
              expect(pkg.grpack.name).toEqual(createGrpack2Dto.name);
            })
        );
      });

      it('should have persisted a newly created package ', async () => {
        await request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto);

        return request(app.getHttpServer())
          .get(GRPACK_ENDPOINT + '/' + createGrpack1Dto.name)
          .set('Accept', 'application/json')
          .send()

          .expect(200);
      });

      it('should not create a new package (package already existing) and respond 409 error', async () => {
        await request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto);

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto)
          .expect(409);
      });

      it('should not create a new package (missing os property) and respond 400 error', () => {
        const missingValue = {
          //os: createOsDto.osName,
          packageName: 'packageName',
          version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (missing packageName property) and respond 400 error', () => {
        const missingValue = {
          os: createOsDto1.osName,
          //packageName: 'packageName',
          version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (missing version property) and respond 400 error', () => {
        const missingValue = {
          os: createOsDto1.osName,
          packageName: 'packageName',
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (missing all properties) and respond 400 error', () => {
        const missingValue = {
          //os: createOsDto.osName,
          //packageName: 'packageName',
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (null os value) and respond 400 error', () => {
        const missingValue = {
          os: null,
          packageName: 'packageName',
          version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (null packageName value) and respond 400 error', () => {
        const missingValue = {
          os: createOsDto1.osName,
          packageName: 'packageName',
          version: null,
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (null version value) and respond 400 error', () => {
        const missingValue = {
          os: createOsDto1.osName,
          packageName: 'packageName',
          version: null,
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (undefined os value) and respond 400 error', () => {
        const missingValue = {
          os: undefined,
          packageName: 'packageName',
          version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (undefined packageName value) and respond 400 error', () => {
        const missingValue = {
          os: createOsDto1.osName,
          packageName: 'packageName',
          version: undefined,
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not create a new package (undefined version value) and respond 400 error', () => {
        const missingValue = {
          os: createOsDto1.osName,
          packageName: 'packageName',
          version: undefined,
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });
    });

    describe('READ', () => {
      const createPackageDto1 = {
        os: createOsDto1.osName,
        packageName: 'packageName',
        version: 'latest',
      } as CreatePackageDto;

      const createPackageDto2 = {
        os: createOsDto2.osName,
        packageName: 'packageName',
        version: 'latest',
      } as CreatePackageDto;

      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto1);

        await request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto2);
      });

      it('should read the list of package of one Grpacks', () => {
        return request(app.getHttpServer())
          .get(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const [pkg1, pkg2] = response.body;

            expect(typeof pkg1.grpack.name).toBe('string');
            expect(typeof pkg1.packageName).toBe('string');
            expect(typeof pkg1.version).toBe('string');
            expect(typeof pkg1.os.osName).toBe('string');

            expect(pkg1.grpack.name).toStrictEqual(createGrpack1Dto.name);
            expect(pkg1.packageName).toStrictEqual(
              createPackageDto1.packageName,
            );
            expect(pkg1.version).toStrictEqual(createPackageDto1.version);
            expect(pkg1.os.osName).toStrictEqual(createPackageDto1.os);

            //--------------------------------------------------------------------

            expect(typeof pkg2.grpack.name).toBe('string');
            expect(typeof pkg2.packageName).toBe('string');
            expect(typeof pkg2.version).toBe('string');
            expect(typeof pkg2.os.osName).toBe('string');

            expect(pkg2.grpack.name).toStrictEqual(createGrpack1Dto.name);
            expect(pkg2.packageName).toStrictEqual(
              createPackageDto1.packageName,
            );
            expect(pkg2.version).toStrictEqual(createPackageDto1.version);
            expect(pkg2.os.osName).toStrictEqual(createPackageDto2.os);
          });
      });

      it('should read the list of package of one Grpacks', () => {
        return request(app.getHttpServer())
          .get(PACKAGES_ENDPOINT1 + '/' + createPackageDto1.os)
          .set('Accept', 'application/json')
          .send()
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.grpack.name).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.os.osName).toBe('string');

            expect(pkg.grpack.name).toStrictEqual(createGrpack1Dto.name);
            expect(pkg.packageName).toStrictEqual(
              createPackageDto1.packageName,
            );
            expect(pkg.version).toStrictEqual(createPackageDto1.version);
            expect(pkg.os.osName).toStrictEqual(createPackageDto1.os);
          });
      });

      it('should respond error 404 when attempting to read a non existing package', () => {
        return request(app.getHttpServer())
          .get(PACKAGES_ENDPOINT1 + '/anything')
          .set('Accept', 'application/json')
          .send()
          .expect(404);
      });
    });

    describe('UPDATE', () => {
      const createPackageDto = {
        os: createOsDto1.osName,
        packageName: 'packageName',
        version: 'latest',
      } as CreatePackageDto;

      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto);
      });

      it('should update nothing (missing all properties) and respond 200 Http Code', () => {
        const missingValue = {
          //os: createOsDto.osName,
          //packageName: 'packageName',
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should update the os (other properties are not defined) and respond 200 Http Code', () => {
        const missingValue = {
          os: createOsDto3.osName,
          //packageName: 'packageName',
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto3.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should update the packageName (other properties are not defined) and respond 200 Http Code', () => {
        const newPackageName = 'newPackageName';

        const missingValue = {
          //os: createOsDto3.osName,
          packageName: newPackageName,
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(newPackageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should update the version (other properties are not defined) and respond 200 Http Code', () => {
        const newVersion = '-312';

        const missingValue = {
          //os: createOsDto3.osName,
          //packageName: newPackageName,
          version: newVersion,
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(newVersion);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should not update the os beacause of its null value (other properties are not defined) and respond 200 Http Code', () => {
        const missingValue = {
          os: null,
          //packageName: 'packageName',
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should not update the packageName beacause of its null value (other properties are not defined) and respond 200 Http Code', () => {
        const missingValue = {
          //os: null,
          packageName: null,
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should not update the version beacause of its null value (other properties are not defined) and respond 200 Http Code', () => {
        const missingValue = {
          //os: null,
          //packageName: null,
          version: null,
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should not update the os beacause of its undefined value (other properties are not defined) and respond 200 Http Code', () => {
        const missingValue = {
          os: undefined,
          //packageName: 'packageName',
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should not update the packageName beacause of its undefined value (other properties are not defined) and respond 200 Http Code', () => {
        const missingValue = {
          //os: null,
          packageName: undefined,
          //version: 'latest',
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should not update the version beacause of its undefined value (other properties are not defined) and respond 200 Http Code', () => {
        const missingValue = {
          //os: null,
          //packageName: null,
          version: undefined,
        } as CreatePackageDto;

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(200)
          .expect((response: request.Response) => {
            const pkg = response.body;

            expect(typeof pkg.os.osName).toBe('string');
            expect(typeof pkg.packageName).toBe('string');
            expect(typeof pkg.version).toBe('string');
            expect(typeof pkg.grpack.name).toBe('string');

            expect(pkg.os.osName).toEqual(createOsDto1.osName);
            expect(pkg.packageName).toEqual(createPackageDto.packageName);
            expect(pkg.version).toEqual(createPackageDto.version);
            expect(pkg.grpack.name).toEqual(createGrpack1Dto.name);
          });
      });

      it('should not update the os beacause of its wrong type (number) value (other properties are not defined) and respond 400 Http Code', () => {
        const missingValue = {
          os: 3,
          //packageName: 'packageName',
          //version: 'latest',
        };

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not update the packageName beacause of its wrong type (number) value (other properties are not defined) and respond 400 Http Code', () => {
        const missingValue = {
          //os: null,
          packageName: 3,
          //version: 'latest',
        };

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not update the version beacause of its wrong type (number) value (other properties are not defined) and respond 400 Http Code', () => {
        const missingValue = {
          //os: null,
          //packageName: null,
          version: 3,
        };

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not update the os beacause of its wrong type (empty object) value (other properties are not defined) and respond 400 Http Code', () => {
        const missingValue = {
          os: {},
          //packageName: 'packageName',
          //version: 'latest',
        };

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not update the packageName beacause of its wrong type (empty object) value (other properties are not defined) and respond 400 Http Code', () => {
        const missingValue = {
          //os: null,
          packageName: {},
          //version: 'latest',
        };

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });

      it('should not update the version beacause of its wrong type (empty object) value (other properties are not defined) and respond 400 Http Code', () => {
        const missingValue = {
          //os: null,
          //packageName: null,
          version: {},
        };

        return request(app.getHttpServer())
          .patch(PACKAGES_ENDPOINT1 + '/' + createPackageDto.os)
          .set('Accept', 'application/json')
          .send(missingValue)
          .expect(400);
      });
    });

    describe('DELETE', () => {
      const createPackageDto1 = {
        os: createOsDto1.osName,
        packageName: 'packageName',
        version: 'latest',
      } as CreatePackageDto;

      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(PACKAGES_ENDPOINT1)
          .set('Accept', 'application/json')
          .send(createPackageDto1);
      });

      it('should delete succesfully an existing grpack', () => {
        return request(app.getHttpServer())
          .delete(PACKAGES_ENDPOINT1 + '/' + createPackageDto1.os)
          .set('Accept', 'application/json')
          .send()
          .expect(200);
      });

      it('should respond an error 404 when we attempt to delete a non existing package', () => {
        return request(app.getHttpServer())
          .delete(PACKAGES_ENDPOINT1 + '/anything')
          .set('Accept', 'application/json')
          .send()
          .expect(404);
      });
    });
  });
});
