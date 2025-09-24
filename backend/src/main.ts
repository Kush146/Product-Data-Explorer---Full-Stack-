import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      limit: 180, // 180 req/min/IP
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // ✅ CORS config
  const allowedOrigins = [
    /^http:\/\/localhost:\d+$/, // local dev
    'https://product-eight-neon.vercel.app', // production
    /\.vercel\.app$/, // preview deploys
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server / curl
      if (
        allowedOrigins.some((o) =>
          o instanceof RegExp ? o.test(origin) : o === origin,
        )
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Product Data Explorer API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start
  await app.listen(process.env.PORT ?? 4000);
  console.log('API running on http://localhost:4000');
  console.log('Swagger docs at http://localhost:4000/docs');
}
bootstrap();
