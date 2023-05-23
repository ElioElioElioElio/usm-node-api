import { Module } from '@nestjs/common';
import { NodeService } from './node.service';
import { NodeController } from './node.controller';
import { EnvironmentModule } from 'src/environment/environment.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NodeGroup } from 'src/node-group/entities/node-group.entity';
import { Node } from './entities/node.entity';
import { Environment } from '../environment/entities/environment.entity';
import { EnvironmentService } from '../environment/environment.service';
import { NodeGroupService } from '../node-group/node-group.service';
import { GrpackBundle } from '../grpack-bundle/entities/grpack-bundle.entity';
import { GrpackBundleModule } from '../grpack-bundle/grpack-bundle.module';
import { GrpackBundleService } from '../grpack-bundle/grpack-bundle.service';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Node, Environment, NodeGroup, GrpackBundle],
    }),
  ],
  controllers: [NodeController],
  providers: [
    NodeService,
    EnvironmentService,
    NodeGroupService,
    GrpackBundleService,
  ],
})
export class NodeModule {}
