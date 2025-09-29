// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1) Prefijo global para alinear con el front (que llama /api/...)
  app.setGlobalPrefix('api');

  // 2) CORS (dejé tu config y lo hice fácil de extender)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    // agregá más origins si los necesitás
  ];
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: false, // poné true si vas a usar cookies/sesiones
  });

  // 3) Validación global (tu config está perfecta)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Swagger en /docs (sigue fuera del prefijo /api, correcto para dev)
  const config = new DocumentBuilder()
    .setTitle('Sistema de Gestión')
    .setDescription('API de Productos')
    .setVersion('1.0.0')
    // .addBearerAuth() // activar cuando sumes JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 4) Escuchar en 0.0.0.0 (andará dentro y fuera de Docker)
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || '0.0.0.0';
  await app.listen(PORT, HOST);

  console.log(`API escuchando en http://${HOST}:${PORT}`);
  console.log(`Swagger: http://${HOST}:${PORT}/docs`);
  console.log(`Prefijo global: /api (ej: GET /api/products)`);
}
bootstrap();
