
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { SellersController } from './sellers.controller';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { PrismaSellerRepository } from
  '../infrastructure/repositories/prisma-seller.repository';

import { PrismaProductRepository } from
  '../infrastructure/repositories/prisma-product.repository';

import { PrismaPromoRepository } from
  '../infrastructure/repositories/prisma-promo-repository';

import { SellerRepository } from
  '../domain/repositories/seller.repository';

import { ProductRepository } from
  '../domain/repositories/product.repository';

import { PromoRepository } from
  '../domain/repositories/promo.repository';

import { CreateSellerAccountUseCase } from
  '../application/use-cases/create-seller-account.use-case';

import { GetSellerProductsUseCase } from
  '../application/use-cases/get-seller-product.use-case';

import { GetSellerPromosUseCase } from
  '../application/use-cases/get-seller-promos.use-case';

import { DeleteSellerProductUseCase } from '../application/use-cases/delete-seller-product.use-case';

import { DeleteSellerPromoUseCase } from
  '../application/use-cases/delete-seller-promo.use-case';

import { GetMySellerProfileUseCase } from
  '../application/use-cases/get-my-seller-profile.use-case';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    SellersController,
  ],

  providers: [
    PrismaService,

    {
      provide: SellerRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaSellerRepository(prisma);
      },
      inject: [PrismaService],
    },

    {
      provide: ProductRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaProductRepository(prisma);
      },
      inject: [PrismaService],
    },

    {
      provide: PromoRepository,
      useFactory: (prisma: PrismaService) => {
        return new PrismaPromoRepository(prisma);
      },
      inject: [PrismaService],
    },

    {
      provide: CreateSellerAccountUseCase,
      useFactory: (repository: SellerRepository) => {
        return new CreateSellerAccountUseCase(repository);
      },
      inject: [SellerRepository],
    },

    {
      provide: GetSellerProductsUseCase,
      useFactory: (
        sellerRepository: SellerRepository,
        productRepository: ProductRepository,
      ) => {
        return new GetSellerProductsUseCase(
          sellerRepository,
          productRepository,
        );
      },
      inject: [
        SellerRepository,
        ProductRepository,
      ],
    },

    {
      provide: GetSellerPromosUseCase,
      useFactory: (
        sellerRepository: SellerRepository,
        promoRepository: PromoRepository,
      ) => {
        return new GetSellerPromosUseCase(
          sellerRepository,
          promoRepository,
        );
      },
      inject: [
        SellerRepository,
        PromoRepository,
      ],
    },

    {
        provide: DeleteSellerProductUseCase,
        useFactory: (
            sellerRepository: SellerRepository,
            productRepository: ProductRepository,
        ) =>
            new DeleteSellerProductUseCase(
            sellerRepository,
            productRepository,
            ),
        inject: [SellerRepository, ProductRepository],
        },

        {
        provide: DeleteSellerPromoUseCase,
        useFactory: (
            sellerRepository: SellerRepository,
            promoRepository: PromoRepository,
        ) =>
            new DeleteSellerPromoUseCase(
            sellerRepository,
            promoRepository,
            ),
        inject: [SellerRepository, PromoRepository],
        },

        {
        provide: GetMySellerProfileUseCase,
        useFactory: (sellerRepository: SellerRepository) => {
            return new GetMySellerProfileUseCase(sellerRepository);
        },
        inject: [SellerRepository],
        },
  ],

  exports: [
    SellerRepository,
  ],
})
export class SellersModule {}
