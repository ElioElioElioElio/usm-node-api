import { Test, TestingModule } from '@nestjs/testing';
import { BundleService } from '../bundle.service';
import { BundleController } from '../../environment/controllers/bundle.controller';

describe('BundleController', () => {
  let controller: BundleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BundleController],
      providers: [BundleService],
    }).compile();

    controller = module.get<BundleController>(BundleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
