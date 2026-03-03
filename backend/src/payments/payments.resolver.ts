import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentMethodType, PaymentType, CreatePaymentMethodInput } from './payment.type';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard, CurrentUser, Roles } from '../common/guards';
import { Role } from '../common/enums';
import { PrismaService } from '../prisma/prisma.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class PaymentsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [PaymentMethodType])
  async myPaymentMethods(@CurrentUser() user: any): Promise<PaymentMethodType[]> {
    return this.prisma.paymentMethod.findMany({ where: { userId: user.id } });
  }

  @Query(() => [PaymentMethodType])
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async allPaymentMethods(): Promise<PaymentMethodType[]> {
    return this.prisma.paymentMethod.findMany();
  }

  // Only ADMIN can add/modify payment methods
  @Mutation(() => PaymentMethodType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addPaymentMethod(
    @Args('input') input: CreatePaymentMethodInput,
    @Args('userId') userId: string,
  ): Promise<PaymentMethodType> {
    const owner = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!owner) throw new NotFoundException('User not found');

    this.validatePaymentMethodInput(input);

    if (input.isDefault) {
      // Unset current default
      await this.prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.create({
      data: { ...input, userId },
    });
  }

  @Mutation(() => PaymentMethodType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updatePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreatePaymentMethodInput,
  ): Promise<PaymentMethodType> {
    this.validatePaymentMethodInput(input);

    const pm = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!pm) throw new NotFoundException('Payment method not found');
    
    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: pm.userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: input,
    });
  }

  @Mutation(() => PaymentMethodType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deletePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PaymentMethodType> {
    return this.prisma.paymentMethod.delete({ where: { id } });
  }

  private validatePaymentMethodInput(input: CreatePaymentMethodInput): void {
    if (input.type === 'upi') {
      if (!input.upiId) {
        throw new BadRequestException('UPI ID is required for UPI payment type');
      }
      return;
    }

    if (!input.last4 || !/^\d{4}$/.test(input.last4)) {
      throw new BadRequestException('last4 must be exactly 4 digits for card payment types');
    }
  }
}
