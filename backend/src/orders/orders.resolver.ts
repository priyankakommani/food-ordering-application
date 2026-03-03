import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrderType, OrderItemInput } from './order.type';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard, CurrentUser, Roles } from '../common/guards';
import { Role } from '../common/enums';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(() => OrderType)
@UseGuards(JwtAuthGuard)
export class OrdersResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [OrderType])
  async orders(@CurrentUser() user: any): Promise<OrderType[]> {
    // Re-BAC: Admin sees all orders, others see only their country's orders
    const where = user.role === 'ADMIN' 
      ? {} 
      : { country: user.country };
    
    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Query(() => [OrderType])
  async myOrders(@CurrentUser() user: any): Promise<OrderType[]> {
    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Query(() => OrderType, { nullable: true })
  async order(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ): Promise<OrderType | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
    if (!order) return null;
    
    // Re-BAC country check
    if (user.role !== 'ADMIN' && order.country !== user.country) {
      throw new ForbiddenException('Access denied for this order');
    }
    return order;
  }

  // All roles can create orders
  @Mutation(() => OrderType)
  async createOrder(
    @Args('restaurantId') restaurantId: string,
    @Args('items', { type: () => [OrderItemInput] }) items: OrderItemInput[],
    @CurrentUser() user: any,
  ): Promise<OrderType> {
    if (!items.length) {
      throw new ForbiddenException('Order must include at least one item');
    }

    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    
    // Re-BAC: Members can only order from their country
    if (user.role !== 'ADMIN' && restaurant.country !== user.country) {
      throw new ForbiddenException(`You can only order from ${user.country} restaurants`);
    }

    const menuItemIds = [...new Set(items.map((item) => item.menuItemId))];
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId,
      },
    });
    const menuItemById = new Map<string, (typeof menuItems)[number]>(
      menuItems.map((menuItem) => [menuItem.id, menuItem]),
    );
    if (menuItems.length !== menuItemIds.length) {
      throw new NotFoundException('Some menu items are invalid for this restaurant');
    }

    // Calculate total using validated menu items.
    let total = 0;
    const orderItems: { menuItemId: string; quantity: number; price: number }[] = [];
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new ForbiddenException('Item quantity must be greater than zero');
      }

      const menuItem = menuItemById.get(item.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      }

      total += menuItem.price * item.quantity;
      orderItems.push({ menuItemId: item.menuItemId, quantity: item.quantity, price: menuItem.price });
    }

    return this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        country: restaurant.country,
        total,
        status: 'PENDING',
        items: { create: orderItems },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }

  // Only ADMIN and MANAGER can place (checkout) orders
  @Mutation(() => OrderType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async placeOrder(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('paymentMethodId') paymentMethodId: string,
    @CurrentUser() user: any,
  ): Promise<OrderType> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING') throw new ForbiddenException('Order is not in pending state');
    
    // Re-BAC country check
    if (user.role !== 'ADMIN' && order.country !== user.country) {
      throw new ForbiddenException('Access denied for this order');
    }

    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: user.id,
      },
    });
    if (!paymentMethod) throw new NotFoundException('Payment method not found');

    // Create payment and update order
    await this.prisma.payment.create({
      data: {
        orderId,
        paymentMethodId,
        amount: order.total,
        status: 'SUCCESS',
      },
    });

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PLACED' },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }

  // Only ADMIN and MANAGER can cancel orders
  @Mutation(() => OrderType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async cancelOrder(
    @Args('orderId', { type: () => ID }) orderId: string,
    @CurrentUser() user: any,
  ): Promise<OrderType> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'CANCELLED') throw new ForbiddenException('Order already cancelled');
    
    // Re-BAC country check
    if (user.role !== 'ADMIN' && order.country !== user.country) {
      throw new ForbiddenException('Access denied for this order');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }
}
