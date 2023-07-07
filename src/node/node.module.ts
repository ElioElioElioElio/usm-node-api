import { Module } from '@nestjs/common';
import { NodeService } from './node.service';
import { NodeController } from './node.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Node } from './entities/node.entity';
import { Environment } from '../environment/entities/environment.entity';
import { EnvironmentService } from '../environment/environment.service';
import { NodeGroupService } from '../group/group.service';
import { Bundle } from '../bundle/entities/bundle.entity';
import { BundleService } from '../bundle/bundle.service';
import { Group } from '../group/entities/group.entity';
import { Grpack } from '../grpack/entities/grpack.entity';
import { GrpackService } from '../grpack/services/grpack.service';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Node, Environment, Group, Bundle, Grpack],
    }),
  ],
  controllers: [NodeController],
  providers: [
    NodeService,
    EnvironmentService,
    NodeGroupService,
    BundleService,
    GrpackService,
  ],
})
export class NodeModule {}
