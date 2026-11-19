import { ProductRepository } from '../../domain/repositories/product.repository';
import { SellerRepository } from '../../domain/repositories/seller.repository';
import { SellerAccountRequiredError } from '../../domain/errors/seller.errors';
import {
  ProductNotFoundError,
} from '../../domain/errors/product.errors';

export class DeleteSellerProductUseCase {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    userId: number,
    productId: number,
  ): Promise<{ id: number }> {
    const seller = await this.sellerRepository.findByUserId(userId);

    if (!seller) {
      throw new SellerAccountRequiredError();
    }

    const deleted = await this.productRepository.deleteByIdAndSellerId(
      productId,
      seller.id,
    );

    if (!deleted) {
      throw new ProductNotFoundError();
    }

    return { id: productId };
  }
}