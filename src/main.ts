import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { EnvironmentModule } from './environment/environment.module';
import { GrpackModule } from './grpack/grpack.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as fs from 'fs';

async function bootstrap() {
  //---HTTPS--------------------------------------------------------------------------------------------------------------
  const httpsOptions = {
    key: fs.readFileSync('./secrets/cert.key'),
    cert: fs.readFileSync('./secrets/cert.crt'),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  /*
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  */

  app.enableCors({ origin: ['http://localhost:5173'] });

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

  app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: true },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
