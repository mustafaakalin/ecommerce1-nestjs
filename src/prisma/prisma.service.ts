import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method for finding user by email with role and permissions
  async findUserByEmailWithRole(email: string) {
    return this.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  // Helper method for finding user by ID with role and permissions
  async findUserByIdWithRole(id: string) {
    return this.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  // Helper method for finding user with safe fields (no sensitive data)
  async findUserSafe(id: string) {
    return this.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        userName: true,
        emailVerifiedAt: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Excluding sensitive fields like password, totpSecret, etc.
      },
    });
  }

  // Helper method to create user with role
  async createUserWithRole(data: {
    email: string;
    password: string;
    name: string;
    userName: string;
    roleName: string;
  }) {
    return this.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        userName: data.userName,
        role: {
          connect: {
            name: data.roleName,
          },
        },
      },
      include: {
        role: true,
      },
    });
  }

  // Helper method to update user's email verification status
  async verifyUserEmail(userId: string) {
    return this.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() },
    });
  }

  // Helper method to update user's TOTP secret
  async updateUserTotpSecret(userId: string, totpSecret: string) {
    return this.user.update({
      where: { id: userId },
      data: { totpSecret },
    });
  }

  // Cleanup method - you can call this in tests
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
      return Promise.all(
        models.map((modelKey) => this[String(modelKey)]?.deleteMany()),
      );
    }
  }
}
