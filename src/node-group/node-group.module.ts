import { Module } from '@nestjs/common';
import { NodeGroupService } from './node-group.service';
import { NodeGroupController } from './node-group.controller';

@Module({
  controllers: [NodeGroupController],
  providers: [NodeGroupService]
})
export class NodeGroupModule {}
