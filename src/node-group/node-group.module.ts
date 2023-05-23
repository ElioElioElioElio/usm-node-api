import { Module } from '@nestjs/common';
import { NodeGroupService } from './node-group.service';
import { NodeGroupController } from './node-group.controller';
import { NodeGroup } from './entities/node-group.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule.forFeature([NodeGroup])],
  controllers: [NodeGroupController],
  providers: [NodeGroupService],
})
export class NodeGroupModule {}
