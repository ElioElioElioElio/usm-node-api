import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './controllers/environment.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Environment } from './entities/environment.entity';
import { NodeController } from './controllers/node.controller';
import { NodeModule } from '../node/node.module';
import { NodeService } from '../node/node.service';
import { NodeGroupModule } from '../node-group/node-group.module';
import { NodeGroupService } from '../node-group/node-group.service';
import { GrpackBundleModule } from '../grpack-bundle/grpack-bundle.module';
import { GrpackBundleService } from '../grpack-bundle/grpack-bundle.service';
import { NodeGroup } from '../node-group/entities/node-group.entity';
import { GrpackBundle } from '../grpack-bundle/entities/grpack-bundle.entity';
import { SharedModule } from '../shared/shared.module';
import { Node } from '../node/entities/node.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Environment, Node, NodeGroup, GrpackBundle],
    }),
    NodeModule,
    SharedModule,
    NodeGroupModule,
    GrpackBundleModule,
  ],
  controllers: [EnvironmentController, NodeController],
  providers: [
    EnvironmentService,
    NodeService,
    NodeGroupService,
    GrpackBundleService,
  ],
})
export class EnvironmentModule {}
