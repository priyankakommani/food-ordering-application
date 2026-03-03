import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserType } from './user.type';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/guards';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any): Promise<UserType> {
    return this.prisma.user.findUnique({ where: { id: user.id } });
  }

  @Query(() => [UserType])
  @UseGuards(JwtAuthGuard)
  async users(@CurrentUser() user: any): Promise<UserType[]> {
    // Admin sees all, Manager/Member see their country
    const where = user.role === 'ADMIN' ? {} : { country: user.country };
    return this.prisma.user.findMany({ where });
  }
}
