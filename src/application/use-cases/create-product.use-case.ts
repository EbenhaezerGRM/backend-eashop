
import { Product } from '../../domain/entities/product.entity';

import {
  ProductRepository,
  CreateProductData,
} from '../../domain/repositories/product.repository';

import { SellerRepository } from
  '../../domain/repositories/seller.repository';

import { SellerAccountRequiredError } from
  '../../domain/errors/seller.errors';

export type CreateProductInput = Omit<CreateProductData, 'sellerId'>;

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly sellerRepository: SellerRepository,
  ) {}

  async execute(
    data: CreateProductInput,
    userId: number,
  ): Promise<Product> {
    const seller = await this.sellerRepository.findByUserId(userId);

    if (!seller) {
      throw new SellerAccountRequiredError();
    }

    return this.productRepository.create({
      ...data,
      sellerId: seller.id,
    });
  }
}
