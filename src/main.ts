import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    // Préfixe global
  app.setGlobalPrefix('api');

  // Validation automatique des DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true,}));

  // CORS pour ton frontend React

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : ['http://localhost:4200'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

    const config = new DocumentBuilder()
    .setTitle('Compagnie API')
    .setDescription('Documentation de l\'API Compagnie')
    .setVersion('1.0')
    .addBearerAuth() 
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); 
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend running on http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
