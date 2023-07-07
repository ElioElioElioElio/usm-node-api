import { Module } from '@nestjs/common';
import { NodeGroupService } from './group.service';
import { Group } from './entities/group.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Environment } from '../environment/entities/environment.entity';
import { EnvironmentService } from '../environment/environment.service';
import { BundleService } from '../bundle/bundle.service';
import { BundleModule } from '../bundle/bundle.module';
import { Bundle } from '../bundle/entities/bundle.entity';
import { GrpackModule } from '../grpack/grpack.module';
import { Grpack } from '../grpack/entities/grpack.entity';
import { GrpackService } from '../grpack/services/grpack.service';
import { Node } from '../node/entities/node.entity';
import { NodeService } from '../node/node.service';
import { NodeModule } from '../node/node.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Group, Environment, Bundle, Grpack, Node]),
  ],
  providers: [
    NodeGroupService,
    EnvironmentService,
    BundleService,
    GrpackService,
    NodeService,
  ],
})
export class NodeGroupModule {}
