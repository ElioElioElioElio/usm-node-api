import { Module } from '@nestjs/common';
import { NodeGroupService } from './group.service';
import { Group } from './entities/group.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Environment } from '../environment/entities/environment.entity';
import { EnvironmentService } from '../environment/environment.service';
import { BundleService } from '../bundle/bundle.service';
import { BundleModule } from '../bundle/bundle.module';
import { Bundle } from '../bundle/entities/bundle.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Group, Environment, Bundle]),
    BundleModule,
  ],
  providers: [NodeGroupService, EnvironmentService, BundleService],
})
export class NodeGroupModule {}
