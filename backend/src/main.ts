import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,       // 1 minute
      limit: 180,                // 180 req/min total per IP
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // single API prefix
  app.setGlobalPrefix('api/v1');

  // CORS for the Next dev/prod
  app.enableCors({
    origin: [/^http:\/\/localhost:\d+$/, /^https?:\/\/.*vercel\.app$/],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  const config = new DocumentBuilder()
    .setTitle('Product Data Explorer API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
  console.log('API on http://localhost:4000');
  console.log('Swagger on http://localhost:4000/docs');
}
bootstrap();
