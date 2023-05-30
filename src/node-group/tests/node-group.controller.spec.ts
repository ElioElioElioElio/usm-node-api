import { Test, TestingModule } from '@nestjs/testing';
import { NodeGroupController } from './node-group.controller';
import { NodeGroupService } from './node-group.service';

describe('NodeGroupController', () => {
  let controller: NodeGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodeGroupController],
      providers: [NodeGroupService],
    }).compile();

    controller = module.get<NodeGroupController>(NodeGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
