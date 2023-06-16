import { Module } from '@nestjs/common';
import { BundleService } from './bundle.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Grpack } from '../grpack/entities/grpack.entity';
import { Bundle } from './entities/bundle.entity';
import { EnvironmentService } from '../environment/environment.service';
import { Environment } from '../environment/entities/environment.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Bundle, Grpack, Environment])],
  providers: [BundleService, EnvironmentService],
})
export class BundleModule {}
