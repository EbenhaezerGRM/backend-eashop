
import { Product } from '../../domain/entities/product.entity';

import { ProductRepository } from
  '../../domain/repositories/product.repository';

import { SellerRepository } from
  '../../domain/repositories/seller.repository';

import { SellerAccountRequiredError } from
  '../../domain/errors/seller.errors';

export class GetSellerProductsUseCase {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(userId: number): Promise<Product[]> {
    const seller = await this.sellerRepository.findByUserId(userId);

    if (!seller) {
      throw new SellerAccountRequiredError();
    }

    return this.productRepository.findBySellerId(seller.id);
  }
}
