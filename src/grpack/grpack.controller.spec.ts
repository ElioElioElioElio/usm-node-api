import { Test, TestingModule } from '@nestjs/testing';
import { GrpackController } from './controllers/grpack.controller';
import { GrpackService } from './services/grpack.service';

describe('GrpackController', () => {
  let controller: GrpackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrpackController],
      providers: [GrpackService],
    }).compile();

    controller = module.get<GrpackController>(GrpackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
