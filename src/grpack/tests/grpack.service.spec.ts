import { Test, TestingModule } from '@nestjs/testing';
import { GrpackService } from '../services/grpack.service';

describe('GrpackService', () => {
  let service: GrpackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrpackService],
    }).compile();

    service = module.get<GrpackService>(GrpackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
