import { Test, TestingModule } from '@nestjs/testing';
import { BundleService } from '../bundle.service';

describe('BundleService', () => {
  let service: BundleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BundleService],
    }).compile();

    service = module.get<BundleService>(BundleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
