
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { OrdersController } from './orders.controller';

import { OrderRepository } from
  '../domain/repositories/order.repository';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { PrismaOrderRepository } from
  '../infrastructure/repositories/prisma-order.repository';

import { GetMyOrdersUseCase } from
  '../application/use-cases/get-my-orders.use-case';

import { GetOrderDetailUseCase } from
  '../application/use-cases/get-order-detail.use-case';

import { CancelOrderUseCase } from
  '../application/use-cases/cancel-order.use-case';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    OrdersController,
  ],

  providers: [
    PrismaService,

    // Repository
    {
      provide: OrderRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaOrderRepository(prisma);
      },
      inject: [PrismaService],
    },

    // Get My Orders
    {
      provide: GetMyOrdersUseCase,
      useFactory: (orderRepository: OrderRepository) => {
        return new GetMyOrdersUseCase(orderRepository);
      },
      inject: [OrderRepository],
    },

    // Get Order Detail
    {
      provide: GetOrderDetailUseCase,
      useFactory: (orderRepository: OrderRepository) => {
        return new GetOrderDetailUseCase(orderRepository);
      },
      inject: [OrderRepository],
    },

    // Cancel Order
    {
      provide: CancelOrderUseCase,
      useFactory: (orderRepository: OrderRepository) => {
        return new CancelOrderUseCase(orderRepository);
      },
      inject: [OrderRepository],
    },
  ],
})
export class OrdersModule {}
