import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service'; // Create this service
import { User } from '@prisma/client';
// This should be a real class/interface representing a user entity

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}



async create(data: { email: string; password: string; roleId: number }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ include: { role: true } });
  }

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id }, include: { role: true } });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

}
