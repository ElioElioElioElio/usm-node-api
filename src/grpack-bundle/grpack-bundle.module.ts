import { Module } from '@nestjs/common';
import { GrpackBundleService } from './grpack-bundle.service';
import { GrpackBundleController } from './grpack-bundle.controller';

@Module({
  controllers: [GrpackBundleController],
  providers: [GrpackBundleService]
})
export class GrpackBundleModule {}
