
import 'dotenv/config';

import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestFactory,
  Reflector,
  HttpAdapterHost,
} from '@nestjs/core';

import { AppModule } from './app.module';

import { ResponseInterceptor } from
  './common/interceptors/response.interceptor';

import { AllExceptionsFilter } from
  './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ResponseInterceptor(
      app.get(Reflector),
    ),
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(
      app.get(HttpAdapterHost),
    ),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();