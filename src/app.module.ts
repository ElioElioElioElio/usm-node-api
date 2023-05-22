import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EnvironmentModule } from './environment/environment.module';
import { SharedModule } from './shared/shared.module';
import { NodeModule } from './node/node.module';
import { GrpackModule } from './grpack/grpack.module';
import { NodeGroupModule } from './node-group/node-group.module';
import { GrpackBundleModule } from './grpack-bundle/grpack-bundle.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    EnvironmentModule,
    SharedModule,
    GrpackModule,
    NodeModule,
    NodeGroupModule,
    GrpackBundleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
