import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { EnvironmentModule } from './environment/environment.module';
import { GrpackModule } from './grpack/grpack.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { snapshot: true });
  app.useGlobalPipes(new ValidationPipe());

  //---ENVIRONMENT ENDPOINT--------------------------------------------------------------------------------------------------------------
  const envSwaggerConfig = new DocumentBuilder()
    .setTitle('USM API : Environment Endpoint')
    .setDescription('Environment Endpoint Documentation')
    .setVersion('1.0')
    .build();
  const envDoument = SwaggerModule.createDocument(app, envSwaggerConfig, {
    include: [EnvironmentModule],
  });
  SwaggerModule.setup('doc/env', app, envDoument);

  //---GRPACK ENDPOINT--------------------------------------------------------------------------------------------------------------
  const grpackSwaggerConfig = new DocumentBuilder()
    .setTitle('USM API : Grpack Endpoint')
    .setDescription('Grpack Endpoint Documentation')
    .setVersion('1.0')
    .build();
  const grpackDoument = SwaggerModule.createDocument(app, grpackSwaggerConfig, {
    include: [GrpackModule],
  });
  SwaggerModule.setup('doc/grpack', app, grpackDoument);

  await app.listen(3000);
}
bootstrap();
