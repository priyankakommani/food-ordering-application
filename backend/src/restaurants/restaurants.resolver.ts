import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RestaurantType, MenuItemType } from './restaurant.type';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/guards';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(() => RestaurantType)
export class RestaurantsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [RestaurantType])
  @UseGuards(JwtAuthGuard)
  async restaurants(@CurrentUser() user: any): Promise<RestaurantType[]> {
    // Re-BAC: Admin sees all, others see only their country
    const where = user.role === 'ADMIN' ? {} : { country: user.country };
    return this.prisma.restaurant.findMany({
      where,
      include: { menuItems: true },
    });
  }

  @Query(() => RestaurantType, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async restaurant(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<RestaurantType | null> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { menuItems: true },
    });
    
    // Re-BAC country check
    if (restaurant && user.role !== 'ADMIN' && restaurant.country !== user.country) {
      return null;
    }
    return restaurant;
  }

  @Query(() => MenuItemType, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async menuItem(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<MenuItemType | null> {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!menuItem) return null;

    if (user.role !== 'ADMIN' && menuItem.restaurant.country !== user.country) {
      return null;
    }

    return menuItem;
  }
}
