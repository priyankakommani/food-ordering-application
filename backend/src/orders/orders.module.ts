import { Module } from '@nestjs/common';
import { OrdersResolver } from './orders.resolver';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../common/guards';

@Module({
  providers: [OrdersResolver],
})
export class OrdersModule {}
