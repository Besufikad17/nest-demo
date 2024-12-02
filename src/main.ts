import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api/v1');

  const config = new DocumentBuilder()
    .setTitle('Nest Demo API Documentation')
    .setDescription('The user and employee account management service API.')
    .setVersion('0.1')
    .addTag('User and Employee Account Management')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // validation config
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
