
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { SellersController } from './sellers.controller';

import { PrismaService } from
  '../infrastructure/database/prisma.service';

import { PrismaSellerRepository } from
  '../infrastructure/repositories/prisma-seller.repository';

import { SellerRepository } from
  '../domain/repositories/seller.repository';

import { CreateSellerAccountUseCase } from
  '../application/use-cases/create-seller-account.use-case';

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
      provide: CreateSellerAccountUseCase,
      useFactory: (repository: SellerRepository) => {
        return new CreateSellerAccountUseCase(repository);
      },
      inject: [SellerRepository],
    },
  ],
})
export class SellersModule {}
