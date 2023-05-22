import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Node } from 'src/node/entities/node.entity';
import { SharedModule } from 'src/shared/shared.module';
import { Environment } from './entities/environment.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [Environment] }),
    SharedModule,
  ],
  controllers: [EnvironmentController],
  providers: [EnvironmentService],
})
export class EnvironmentModule {}
