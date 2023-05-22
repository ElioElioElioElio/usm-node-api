import { Module } from '@nestjs/common';
import { NodeService } from './node.service';
import { NodeController } from './node.controller';
import { EnvironmentModule } from 'src/environment/environment.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NodeGroup } from 'src/node-group/entities/node-group.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [NodeGroup] }),
    EnvironmentModule,
  ],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
