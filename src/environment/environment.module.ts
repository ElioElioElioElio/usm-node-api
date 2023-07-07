import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './controllers/environment.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Environment } from './entities/environment.entity';
import { NodeController } from './controllers/node.controller';
import { NodeModule } from '../node/node.module';
import { NodeService } from '../node/node.service';
import { NodeGroupModule } from '../group/group.module';
import { NodeGroupService } from '../group/group.service';
import { BundleModule } from '../bundle/bundle.module';
import { BundleService } from '../bundle/bundle.service';
import { Group } from '../group/entities/group.entity';
import { Bundle } from '../bundle/entities/bundle.entity';
import { SharedModule } from '../shared/shared.module';
import { Node } from '../node/entities/node.entity';
import { GroupController } from './controllers/group.controller';
import { BundleController } from './controllers/bundle.controller';
import { GrpackModule } from '../grpack/grpack.module';
import { GrpackService } from '../grpack/services/grpack.service';
import { Grpack } from '../grpack/entities/grpack.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [Environment, Node, Bundle, Grpack, Group],
    }),
    NodeModule,
    SharedModule,
    BundleModule,
    GrpackModule,
    NodeGroupModule,
  ],
  controllers: [
    EnvironmentController,
    NodeController,
    GroupController,
    BundleController,
  ],
  providers: [
    EnvironmentService,
    NodeService,
    BundleService,
    GrpackService,
    NodeGroupService,
  ],
})
export class EnvironmentModule {}
