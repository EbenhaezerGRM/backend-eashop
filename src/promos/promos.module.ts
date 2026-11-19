
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SellersModule } from '../sellers/sellers.module';

import { PromosController } from './promos.controller';

import { PromoRepository } from
  '../domain/repositories/promo.repository';

import { SellerRepository } from
  '../domain/repositories/seller.repository';

import { PrismaPromoRepository } from
  '../infrastructure/repositories/prisma-promo-repository';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { CreatePromoUseCase } from
  '../application/use-cases/create-promo.use-case';

import { GetPromosUseCase } from
  '../application/use-cases/get-promos.use-case';

@Module({
  imports: [
    AuthModule,
    SellersModule,
  ],

  controllers: [PromosController],

  providers: [
    PrismaService,

    {
      provide: PromoRepository,
      useClass: PrismaPromoRepository,
    },

    {
      provide: CreatePromoUseCase,
      useFactory: (
        promoRepository: PromoRepository,
        sellerRepository: SellerRepository,
      ) =>
        new CreatePromoUseCase(
          promoRepository,
          sellerRepository,
        ),
      inject: [
        PromoRepository,
        SellerRepository,
      ],
    },

    {
      provide: GetPromosUseCase,
      useFactory: (repository: PromoRepository) =>
        new GetPromosUseCase(repository),
      inject: [PromoRepository],
    },
  ],

  exports: [PromoRepository],
})
export class PromosModule {}
