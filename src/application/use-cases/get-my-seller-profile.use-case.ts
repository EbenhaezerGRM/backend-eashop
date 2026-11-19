import { SellerRepository } from
  '../../domain/repositories/seller.repository';

import { SellerAccountRequiredError } from
  '../../domain/errors/seller.errors';

export class GetMySellerProfileUseCase {
  constructor(
    private readonly sellerRepository: SellerRepository,
  ) {}

  async execute(userId: number) {
    const seller = await this.sellerRepository.findByUserId(userId);

    if (!seller) {
      throw new SellerAccountRequiredError();
    }

    return {
      sellerId: seller.id,
      userId: seller.userId,
      storeName: seller.storeName,
      description: seller.description,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
    };
  }
}