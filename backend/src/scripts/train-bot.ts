import { webcrypto } from 'crypto';
globalThis.crypto = webcrypto as any;
import { NestFactory } from '@nestjs/core';
// ... rest of your code
