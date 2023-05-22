import { Module } from '@nestjs/common';
import { GrpackService } from './services/grpack.service';
import { GrpackController } from './controllers/grpack.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Grpack } from './entities/grpack.entity';
import { OsService } from './services/os.service';
import { OsController } from './controllers/os.controller';
import { Os } from './entities/os.entity';
import { PackageDataController } from './controllers/package-data.controller';
import { PackageDataService } from './services/package-data.service';
import { PackageData } from './entities/package-data.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Grpack, Os, PackageData])],
  controllers: [GrpackController, OsController, PackageDataController],
  providers: [GrpackService, OsService, PackageDataService],
})
export class GrpackModule {}
