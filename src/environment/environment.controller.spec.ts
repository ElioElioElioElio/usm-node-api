import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentController } from './controllers/environment.controller';
import { EnvironmentService } from './environment.service';
import exp from 'constants';
import { Environment } from './entities/environment.entity';
import { Entity, FilterQuery } from '@mikro-orm/core';
import { UpdateEnvironmentDto } from './dto/environments/update-environment.dto';

describe('EnvironmentController', () => {
  let controller: EnvironmentController;

  const environmentStub = new Environment();
  environmentStub.name = 'envName';

  const environmentServiceMock = {
    create: jest.fn((dto) => {
      const env = new Environment();
      env.name = dto.name;
      return env;
    }),

    findAll: jest.fn(() => [environmentStub]),

    findBy: jest.fn((a: { name: string }) => {
      const env = new Environment();
      env.name = a.name;
      return env;
    }),

    update: jest.fn((id: string, dto: UpdateEnvironmentDto) => {}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnvironmentController],
      providers: [EnvironmentService],
    })
      .overrideProvider(EnvironmentService)
      .useValue(environmentServiceMock)
      .compile();

    controller = module.get<EnvironmentController>(EnvironmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an environment', () => {
    const dto = { name: 'environment' };
    const env = new Environment();
    env.name = dto.name;

    expect(controller.create(dto)).toEqual(env);
    expect(environmentServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should find an env by name', () => {
    const name = 'environment';
    const env = new Environment();
    env.name = name;

    expect(controller.findOne(name)).toEqual(env);
    expect(environmentServiceMock.findBy).toHaveBeenCalledWith({ name: name });
  });

  it('should find an env by name', () => {
    const name = 'environment';
    const env = new Environment();
    const updateDto = new UpdateEnvironmentDto();

    expect(controller.update(name, updateDto)).toEqual(env);
    expect(environmentServiceMock).toHaveBeenCalledWith({ name: name });
  });
});
