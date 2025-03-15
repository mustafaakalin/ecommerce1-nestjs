import { Controller, Get, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { I18nService, I18n, I18nContext } from 'nestjs-i18n';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('ctrl2')
export class AppController {
  constructor(private readonly appService: AppService, private readonly i18n: I18nService) {}

  @CacheKey('hello')
  @CacheTTL(60000)
  @Version('1')
  @Get()
  async getHello(@I18n() i18n: I18nContext) {
    // For demonstration purposes, we will simulate a delay
    // to show that the cache is working as expected.
    await new Promise(resolve => setTimeout(resolve, 3000));

    return this.appService.getHello();
  }
}
