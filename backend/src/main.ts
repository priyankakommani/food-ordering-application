import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvFromFile(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromFile();

function normalizeOrigin(value: string): string {
  return value.replace(/\/+$/, '');
}

function buildAllowedOrigins(): Set<string> {
  const envValue = process.env.FRONTEND_URL || 'http://localhost:3000';
  const fromEnv = envValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  const defaults = ['http://localhost:3000', 'http://127.0.0.1:3000'].map(normalizeOrigin);
  return new Set([...defaults, ...fromEnv]);
}

async function bootstrap() {
  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = buildAllowedOrigins();
  const allowVercelPreview = (process.env.ALLOW_VERCEL_PREVIEW || 'false').toLowerCase() === 'true';

  app.enableCors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow non-browser clients and same-origin server calls.
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      if (allowVercelPreview && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/graphql`);
}

bootstrap();
