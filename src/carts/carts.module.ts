
import { Module } from '@nestjs/common';

import { CartsController } from './carts.controller';

import { CartRepository } from
  '../domain/repositories/cart.repository';

import { ProductRepository } from
  '../domain/repositories/product.repository';

import { PrismaCartRepository } from
  '../infrastructure/repositories/prisma-cart.repository';

import { UpdateCartItemUseCase } from
  '../application/use-cases/update-cart-item.use-case';

import { PrismaProductRepository } from
  '../infrastructure/repositories/prisma-product.repository';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { GetCartUseCase } from
  '../application/use-cases/get-cart.use-case';

import { AddCartItemUseCase } from
  '../application/use-cases/add-cart-item.use-case';

import { DeleteCartItemUseCase } from
  '../application/use-cases/delete-cart-item.use-case';

import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [AuthModule],
  controllers: [CartsController],

  providers: [
    PrismaService,

    {
      provide: CartRepository,
      useClass: PrismaCartRepository,
    },

    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },

    {
      provide: GetCartUseCase,
      useFactory: (repository: CartRepository) =>
        new GetCartUseCase(repository),
      inject: [CartRepository],
    },

    {
      provide: AddCartItemUseCase,
      useFactory: (
        cartRepository: CartRepository,
        productRepository: ProductRepository,
      ) =>
        new AddCartItemUseCase(
          cartRepository,
          productRepository,
        ),
      inject: [CartRepository, ProductRepository],
    },

    {
    provide: UpdateCartItemUseCase,
    useFactory: (
        cartRepository: CartRepository,
        productRepository: ProductRepository,
    ) =>
        new UpdateCartItemUseCase(
        cartRepository,
        productRepository,
        ),
    inject: [CartRepository, ProductRepository],
    },

    {
    provide: DeleteCartItemUseCase,
    useFactory: (cartRepository: CartRepository) =>
        new DeleteCartItemUseCase(cartRepository),
    inject: [CartRepository],
    },

  ],

  exports: [CartRepository],
})
export class CartsModule {}
