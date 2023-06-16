import { Module } from '@nestjs/common';
import { GrpackService } from './services/grpack.service';
import { GrpackController } from './controllers/grpack.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Grpack } from './entities/grpack.entity';
import { OsService } from './services/os.service';
import { OsController } from './controllers/os.controller';
import { Os } from './entities/os.entity';
import { PackagesController } from './controllers/packages.controller';
import { PackagesService } from './services/packages.service';
import { Package } from './entities/package.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Grpack, Os, Package])],
  controllers: [GrpackController, OsController, PackagesController],
  providers: [GrpackService, OsService, PackagesService],
})
export class GrpackModule {}
