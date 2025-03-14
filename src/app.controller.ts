import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { I18nService, I18n, I18nContext } from 'nestjs-i18n';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly i18n: I18nService) {}

  @Get()
  async getHello(@I18n() i18n: I18nContext): Promise<string> {
    const message = await this.i18n.translate('WELCOME_MESSAGE');
    return await i18n.t('test.WELCOME_MESSAGE');
  }
}
