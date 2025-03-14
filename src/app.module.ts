import { Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import * as path from 'path';
import { I18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import { ConfigModule } from '@nestjs/config';
import 'dotenv/config'
import { LoggerModule } from 'nestjs-pino';
import { SettingsModule } from './settings/settings.module';
import { SharedModule } from './shared/shared.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
      cache: true,
      expandVariables: true,
      // Consider adding Joi validation for environment variables
    }),

    // Core modules
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
        new HeaderResolver(["x-custom-lang"]),
        AcceptLanguageResolver,
      ],
    }),

    // Advanced logging configuration
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'ecommerce-api',
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        transport: process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              }
            }
          : undefined,
        autoLogging: {
          ignore: (req) => req.url.includes('health') || req.url.includes('metrics'),
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

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
