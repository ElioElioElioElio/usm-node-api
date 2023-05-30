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
import { APP_FILTER } from '@nestjs/core';
import { UniqueConstraintViolationExceptionFilter } from './shared/exception-filters/unique-constraint-violation.exception-filter';
import { NotFoundErrorExceptionFilter } from './shared/exception-filters/not-found.exception-filter';

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
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: UniqueConstraintViolationExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundErrorExceptionFilter },
  ],
})
export class AppModule {}
