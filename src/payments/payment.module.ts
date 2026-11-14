
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { PaymentsController } from './payment.controller';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { PrismaPaymentRepository } from
  '../infrastructure/repositories/prisma-payment.repository';

import { PaymentRepository } from
  '../domain/repositories/payment.repository';

import { DummyPayOrderUseCase } from
  '../application/use-cases/dummy-pay-order.use-case';

import { DummyFailOrderUseCase } from
  '../application/use-cases/dummy-fail-order.use-case';

import { GetOrderPaymentsUseCase } from
  '../application/use-cases/get-order-payments.use-case';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    PaymentsController,
  ],

  providers: [
    PrismaService,

    {
      provide: PaymentRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaPaymentRepository(prisma);
      },
      inject: [PrismaService],
    },

    {
      provide: DummyPayOrderUseCase,
      useFactory: (repository: PaymentRepository) => {
        return new DummyPayOrderUseCase(repository);
      },
      inject: [PaymentRepository],
    },

    {
      provide: DummyFailOrderUseCase,
      useFactory: (repository: PaymentRepository) => {
        return new DummyFailOrderUseCase(repository);
      },
      inject: [PaymentRepository],
    },

    {
      provide: GetOrderPaymentsUseCase,
      useFactory: (repository: PaymentRepository) => {
        return new GetOrderPaymentsUseCase(repository);
      },
      inject: [PaymentRepository],
    },
  ],
})
export class PaymentsModule {}
