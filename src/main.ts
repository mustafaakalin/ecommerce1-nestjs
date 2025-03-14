import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet'; // https://docs.nestjs.com/security/helmet
import compression from '@fastify/compress'; // https://docs.nestjs.com/techniques/compression#use-with-fastify
import { Logger } from 'nestjs-pino'; // https://docs.nestjs.com/techniques/logger (Pino Logger)  https://www.npmjs.com/package/nestjs-pino

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(), // { logger: true } // Enable Fastify logger
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger)) // Enable Pino logger

  app.useGlobalPipes(new ValidationPipe());

  await app.register(helmet, {
    // Configure helmet options here (optional)
    // For example:
    // contentSecurityPolicy: {
    //   directives: {
    //     defaultSrc: [`'self'`],
    //     styleSrc: [`'self'`, `'unsafe-inline'`],
    //     imgSrc: [`'self'`, 'data:'],
    //     scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
    //   },
    // },
    // Configuration Options helmet (Optional):

    // contentSecurityPolicy: Controls Content Security Policy (CSP) headers to prevent cross-site scripting (XSS) attacks.
    // crossOriginEmbedderPolicy: Controls whether a site can embed cross-origin resources.
    // crossOriginOpenerPolicy: Controls whether a site can open cross-origin popups.
    // crossOriginResourcePolicy: Controls which cross-origin resources can be loaded.
    // dnsPrefetchControl: Controls DNS prefetching.
    // expectCt: Enforces Certificate Transparency.
    // frameguard: Prevents clickjacking.
    // hidePoweredBy: Removes the X-Powered-By header.
    // hsts: Enforces HTTPS.
    // ieNoOpen: Prevents IE from executing downloads in the site's context.
    // noSniff: Prevents MIME type sniffing.
    // originAgentCluster: Isolates origin-keyed agent clusters.
    // permittedCrossDomainPolicies: Controls Adobe Flash/PDF loading.
    // referrerPolicy: Controls the Referrer header.
    // strictTransportSecurity: Enforces HTTPS via HSTS.
    // xContentTypeOptions: Sets the X-Content-Type-Options header.
    // xDnsPrefetchControl: Controls DNS prefetching.
    // xDownloadOptions: Sets the X-Download-Options header.
    // xFrameOptions: Sets the X-Frame-Options header.
    // xPermittedCrossDomainPolicies: Sets the X-Permitted-Cross-Domain-Policies header.
    // xPoweredBy: Sets the X-Powered-By header.
    // xReferrerPolicy: Sets the X-Referrer-Policy header.
    // xXssProtection: Enables XSS protection.
  });

  await app.register(compression, { encodings: ['gzip', 'deflate'] });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
