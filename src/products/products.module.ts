
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SellersModule } from '../sellers/sellers.module';

import { ProductsController } from './products.controller';

import { GetProductsUseCase } from
  '../application/use-cases/get-products.use-case';

import { CreateProductUseCase } from
  '../application/use-cases/create-product.use-case';

import { ProductRepository } from
  '../domain/repositories/product.repository';

import { SellerRepository } from
  '../domain/repositories/seller.repository';

import { PrismaProductRepository } from
  '../infrastructure/repositories/prisma-product.repository';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { SearchProductsUseCase } from
  '../application/use-cases/search-products.use-case';

@Module({
  imports: [
    AuthModule,
    SellersModule,
  ],

  controllers: [ProductsController],

  providers: [
    PrismaService,

    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },

    {
      provide: GetProductsUseCase,
      useFactory: (repository: ProductRepository) =>
        new GetProductsUseCase(repository),
      inject: [ProductRepository],
    },

    {
      provide: CreateProductUseCase,
      useFactory: (
        productRepository: ProductRepository,
        sellerRepository: SellerRepository,
      ) =>
        new CreateProductUseCase(
          productRepository,
          sellerRepository,
        ),
      inject: [
        ProductRepository,
        SellerRepository,
      ],
    },

    {
      provide: SearchProductsUseCase,
      useFactory: (repository: ProductRepository) =>
        new SearchProductsUseCase(repository),
      inject: [ProductRepository],
    },
  ],
})
export class ProductsModule {}
