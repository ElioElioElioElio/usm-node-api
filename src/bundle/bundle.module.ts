import { Module } from '@nestjs/common';
import { BundleService } from './bundle.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Grpack } from '../grpack/entities/grpack.entity';
import { Bundle } from './entities/bundle.entity';
import { EnvironmentService } from '../environment/environment.service';
import { Environment } from '../environment/entities/environment.entity';
import { GrpackService } from '../grpack/services/grpack.service';

@Module({
  imports: [MikroOrmModule.forFeature([Bundle, Grpack, Environment, Grpack])],
  providers: [BundleService, EnvironmentService, GrpackService],
})
export class BundleModule {}
