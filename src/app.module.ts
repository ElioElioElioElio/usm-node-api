import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EnvironmentModule } from './environment/environment.module';
import { SharedModule } from './shared/shared.module';
import { NodeModule } from './node/node.module';
import { GrpackModule } from './grpack/grpack.module';
import { NodeGroupModule } from './group/group.module';
import { BundleModule } from './bundle/bundle.module';
import { APP_FILTER } from '@nestjs/core';
import { UniqueConstraintViolationExceptionFilter } from './shared/exception-filters/unique-constraint-violation.exception-filter';
import { NotFoundErrorExceptionFilter } from './shared/exception-filters/not-found.exception-filter';
import { ConfigModule } from '@nestjs/config';
import { LoginModule } from './login/login.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MikroOrmModule.forRoot(),
    EnvironmentModule,
    SharedModule,
    GrpackModule,
    NodeModule,
    NodeGroupModule,
    BundleModule,
    LoginModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: UniqueConstraintViolationExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundErrorExceptionFilter },
  ],
})
export class AppModule {}
