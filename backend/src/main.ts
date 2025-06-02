
import { ReadableStream } from 'web-streams-polyfill';
import { webcrypto } from 'crypto';

if (typeof globalThis.ReadableStream === 'undefined') {
  (globalThis as any).ReadableStream = ReadableStream;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

  if (!globalThis.crypto) {
    globalThis.crypto = webcrypto as unknown as Crypto;
  }
  

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3002', 'http://192.168.1.4:3002'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();