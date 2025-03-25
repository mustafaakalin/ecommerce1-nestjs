import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Version,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './dto/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Version('1')
  @Public()
  @Get('public')
  findAll() {
    return [];
  }

  @Version('1')
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Version('1')
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  // google Oauth
  //   @UseGuards(AuthGuard('google'))
  //   @Get('google')
  //   async googleAuth() {}

  //   @UseGuards(AuthGuard('google'))
  //   @Get('google/callback')
  //   async googleAuthCallback(@Req() req) {
  //     const user = req.user;
  //     const dbUser = await this.prisma.user.upsert({
  //       where: { googleId: user.googleId },
  //       update: {},
  //       create: {
  //         googleId: user.googleId,
  //         email: user.email,
  //         name: user.name,
  //         roleId: 'customer-role-id',
  //       },
  //     });
  //     return this.generateTokens(dbUser);
  //   }
}
