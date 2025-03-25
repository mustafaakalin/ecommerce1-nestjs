import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.auth.dto';
import { LoginDto } from './dto/login.auth.dto';
import * as speakeasy from 'speakeasy';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private mailerService: MailerService,
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

    async validateUser(email: string, pass: string): Promise<User | null> {
        const user = await this.usersService.findOne(email);
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }


  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        userName: dto.userName,
        password: hashedPassword,
        roleId: 'customer-role-id', // Default role
      },
    });
    const token = this.jwtService.sign({ sub: user.id, type: 'verification' });
    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'Verify your email',
      text: `Token: ${token}`,
    });
    return { message: 'Verification email sent' };
  }

  async login(dto: LoginDto) {
    this.logger.log(`User login attempt: ${dto.email}`);
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.twoFactorEnabled) {
      return { requires2FA: true, userId: user.id };
    }
    this.logger.log(`User logged in: ${dto.email}`);
    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role.name,
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
    });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return {
      accessToken: this.jwtService.sign({ sub: user.id, role: user.role.name }),
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async resetPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    const token = this.jwtService.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: '1h' },
    );
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Reset Token: ${token}`,
    });
    return { message: 'Reset email sent' };
  }

  async verifyEmail(token: string) {
    const payload = this.jwtService.verify(token);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { emailVerifiedAt: new Date() },
    });
    return { message: 'Email verified' };
  }

  async enable2FA(userId: string) {
    const secret = speakeasy.generateSecret({ name: 'YourApp' });
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32, twoFactorEnabled: true },
    });
    return { qrCodeUrl: secret.otpauth_url }; // Display QR code to user
  }

  async verify2FA(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });
    if (!verified) throw new UnauthorizedException('Invalid 2FA code');
    return this.generateTokens(user);
  }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
