import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { EnvironmentModule } from './environment/environment.module';
import { UniqueConstraintViolationExceptionFilter } from './shared/exception-filters/unique-constraint-violation.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { snapshot: true });
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Documentation')
    .setDescription('USM API Documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  const envSwaggerConfig = new DocumentBuilder()
    .setTitle('USM API : Environment Endpoint')
    .setDescription('Environment Endpoint Documentation')
    .setVersion('1.0')
    .build();
  const envDoument = SwaggerModule.createDocument(app, envSwaggerConfig, {
    include: [EnvironmentModule],
  });
  SwaggerModule.setup('doc/env', app, envDoument);

  await app.listen(3000);
}
bootstrap();
