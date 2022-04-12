import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';

(async () => {
  const logger = new Logger('Main');
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);

  // Global validation Pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.use(
    '/docs',
    basicAuth({
      challenge: true,
      users: {
        [process.env.DOCS_API_USER]: process.env.DOCS_API_PASSWORD,
      },
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Docs API')
    .setDescription('The APIs docs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);
  logger.log(`Docs API is running on /docs`);

  await app.listen(port, () => {
    logger.log(`Auth Api listening in port: ${port}`);
  });
})();
