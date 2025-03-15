import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache, private readonly i18n: I18nService) {}

  async getHello() {

    this.logger.log('Cache miss: computing cache');

    const data = this.i18n.t('test.WELCOME_MESSAGE',{ lang:   I18nContext.current().lang });

    await this.cacheManager.set('hello', data);

    return data;
  }

}
