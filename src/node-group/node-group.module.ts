import { Module } from '@nestjs/common';
import { NodeGroupService } from './node-group.service';
import { NodeGroupController } from './node-group.controller';
import { NodeGroup } from './entities/node-group.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Environment } from '../environment/entities/environment.entity';
import { EnvironmentService } from '../environment/environment.service';
import { GrpackBundleService } from '../grpack-bundle/grpack-bundle.service';
import { GrpackBundleModule } from '../grpack-bundle/grpack-bundle.module';
import { GrpackBundle } from '../grpack-bundle/entities/grpack-bundle.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([NodeGroup, Environment, GrpackBundle]),
    GrpackBundleModule,
  ],
  controllers: [NodeGroupController],
  providers: [NodeGroupService, EnvironmentService, GrpackBundleService],
})
export class NodeGroupModule {}
