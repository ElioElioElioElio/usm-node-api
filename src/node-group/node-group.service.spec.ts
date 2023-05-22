import { Test, TestingModule } from '@nestjs/testing';
import { NodeGroupService } from './node-group.service';

describe('NodeGroupService', () => {
  let service: NodeGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodeGroupService],
    }).compile();

    service = module.get<NodeGroupService>(NodeGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
