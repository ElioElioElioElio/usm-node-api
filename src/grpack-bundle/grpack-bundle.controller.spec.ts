import { Test, TestingModule } from '@nestjs/testing';
import { GrpackBundleController } from './grpack-bundle.controller';
import { GrpackBundleService } from './grpack-bundle.service';

describe('GrpackBundleController', () => {
  let controller: GrpackBundleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrpackBundleController],
      providers: [GrpackBundleService],
    }).compile();

    controller = module.get<GrpackBundleController>(GrpackBundleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
