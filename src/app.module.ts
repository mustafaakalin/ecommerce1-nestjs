import { Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import * as path from 'path';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import { ConfigModule, ConfigService } from '@nestjs/config';
import 'dotenv/config';
import { LoggerModule } from 'nestjs-pino';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import KeyvRedis, { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { CaslModule } from './casl/casl.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
      cache: true,
      expandVariables: true,
      // Consider adding Joi validation for environment variables
    }),

    // Cache module
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('REDIS_HOST', 'redis');
        const redisPort = configService.get('REDIS_PORT', '6379');
        const redisUsername = configService.get('REDIS_USERNAME', '');
        const redisPassword = configService.get('REDIS_PASSWORD', 'redispassword');
        const ttl = configService.get('CACHE_TTL', 1_000); // Default to 1 minute if not specified

        // Build the Redis connection string
        const redisUrl = `redis://${redisUsername ? `${redisUsername}:${redisPassword}@` : ''}${redisHost}:${redisPort}`;

            // const keyv = new Keyv(new KeyvRedis('redis://:redispassword@redis:6379'));
            // keyv.on('error', handleConnectionError);
        return {
          stores: [
            createKeyv('redis://:redispassword@redis:6379', { namespace: 'AKALINTECH-ecom1' }),
          ],
        };
      },
      inject: [ConfigService],
    }),

    // Core modules

    AuthModule,
    UsersModule,

    // Internationalization with optimized settings
    I18nModule.forRoot({
      fallbackLanguage: process.env.APP_FALLBACK_LANG_ALL,
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),

    // Advanced logging configuration
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'ecommerce-api',
        level: process.env.APP_NODE_ENV !== 'production' ? 'debug' : 'info',
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
        ],
        transport:
          process.env.APP_NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        autoLogging: {
          ignore: (req) =>
            req.url.includes('health') || req.url.includes('metrics'),
        },
        customProps: () => ({ context: 'HTTP' }),
        customLogLevel: (req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
      },
      exclude: [
        { method: RequestMethod.ALL, path: 'check' },
        { method: RequestMethod.ALL, path: 'health' },
        { method: RequestMethod.ALL, path: 'metrics' },
      ],
    }),

    SettingsModule,

    SharedModule,

    CaslModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
function handleConnectionError(...arguments_: any[]): void {
  throw new Error('Function not implemented.');
}

