import { Module } from '@nestjs/common';
import { GrpackBundleService } from './grpack-bundle.service';
import { GrpackBundleController } from './grpack-bundle.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Grpack } from '../grpack/entities/grpack.entity';
import { GrpackBundle } from './entities/grpack-bundle.entity';
import { GrpackModule } from '../grpack/grpack.module';
import { SharedModule } from '../shared/shared.module';
import { EnvironmentModule } from '../environment/environment.module';
import { EnvironmentService } from '../environment/environment.service';
import { Environment } from '../environment/entities/environment.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([GrpackBundle, Grpack, Environment]),
    GrpackModule,
    SharedModule,
    EnvironmentModule,
  ],
  controllers: [GrpackBundleController],
  providers: [GrpackBundleService, EnvironmentService],
})
export class GrpackBundleModule {}
