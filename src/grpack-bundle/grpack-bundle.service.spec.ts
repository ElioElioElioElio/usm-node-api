import { Test, TestingModule } from '@nestjs/testing';
import { GrpackBundleService } from './grpack-bundle.service';

describe('GrpackBundleService', () => {
  let service: GrpackBundleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrpackBundleService],
    }).compile();

    service = module.get<GrpackBundleService>(GrpackBundleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
