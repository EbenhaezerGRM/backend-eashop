
import { Module } from '@nestjs/common';

import { PromosController } from './promos.controller';

import { PromoRepository } from
  '../domain/repositories/promo.repository';

import { PrismaPromoRepository } from
  '../infrastructure/repositories/prisma-promo-repository';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { CreatePromoUseCase } from
  '../application/use-cases/create-promo.use-case';

import { GetPromosUseCase } from
  '../application/use-cases/get-promos.use-case';

@Module({
  controllers: [PromosController],

  providers: [
    PrismaService,

    {
      provide: PromoRepository,
      useClass: PrismaPromoRepository,
    },

    {
      provide: CreatePromoUseCase,
      useFactory: (repository: PromoRepository) =>
        new CreatePromoUseCase(repository),
      inject: [PromoRepository],
    },

    {
      provide: GetPromosUseCase,
      useFactory: (repository: PromoRepository) =>
        new GetPromosUseCase(repository),
      inject: [PromoRepository],
    },
  ],
})
export class PromosModule {}
