import { Module } from '@nestjs/common';

import { CartsModule } from '../carts/carts.module';
import { PromosModule } from '../promos/promos.module';

import { CartRepository } from
  '../domain/repositories/cart.repository';

import { PromoRepository } from
  '../domain/repositories/promo.repository';

import { PromoValidator } from
  '../domain/services/promo-validator';

import { DiscountCalculator } from
  '../domain/services/discount-calculator';

import { PromoEvaluationService } from
  '../domain/services/promo-evaluation.service';

import { ShippingService } from
  '../domain/services/shipping.service';

import { CheckoutCalculator } from
  '../domain/services/checkout-calculator';

import { CheckoutUseCase } from
  '../application/use-cases/checkout-use-case';

import { CheckoutController } from
  './checkout.controller';

import { AuthModule } from '../auth/auth.module';

import { CreateOrderUseCase } from
  '../application/use-cases/create-order.use-case';

import { OrderRepository } from
  '../domain/repositories/order.repository';

import { PrismaOrderRepository } from
  '../infrastructure/repositories/prisma-order.repository';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

@Module({
  imports: [AuthModule, CartsModule, PromosModule],

  controllers: [CheckoutController],
  providers: [
    {
      provide: PromoEvaluationService,
      useFactory: () =>
        new PromoEvaluationService(
          new PromoValidator(),
          new DiscountCalculator(),
        ),
    },

    {
      provide: ShippingService,
      useFactory: () => new ShippingService(),
    },

    {
      provide: CheckoutCalculator,
      useFactory: () => new CheckoutCalculator(),
    },

    {
      provide: CheckoutUseCase,
      useFactory: (
        cartRepository: CartRepository,
        promoRepository: PromoRepository,
        shippingService: ShippingService,
        promoEvaluationService: PromoEvaluationService,
        checkoutCalculator: CheckoutCalculator,
      ) =>
        new CheckoutUseCase(
          cartRepository,
          promoRepository,
          shippingService,
          promoEvaluationService,
          checkoutCalculator,
        ),
      inject: [
        CartRepository,
        PromoRepository,
        ShippingService,
        PromoEvaluationService,
        CheckoutCalculator,
      ],
    },

    // Prisma Service
    PrismaService,

    // Order Repository
    {
      provide: OrderRepository,
      useFactory: (prismaService: PrismaService) =>
        new PrismaOrderRepository(prismaService),
      inject: [PrismaService],
    },

    // Create Order Use Case
    {
      provide: CreateOrderUseCase,
      useFactory: (
        checkoutUseCase: CheckoutUseCase,
        orderRepository: OrderRepository,
      ) =>
        new CreateOrderUseCase(
          checkoutUseCase,
          orderRepository,
        ),
      inject: [
        CheckoutUseCase,
        OrderRepository,
      ],
    },
  ],

  exports: [CheckoutUseCase],
})
export class CheckoutModule {}