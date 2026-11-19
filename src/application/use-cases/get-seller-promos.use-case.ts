
import { Promo } from '../../domain/entities/promo.entity';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { SellerRepository } from
  '../../domain/repositories/seller.repository';

import { SellerAccountRequiredError } from
  '../../domain/errors/seller.errors';

export class GetSellerPromosUseCase {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly promoRepository: PromoRepository,
  ) {}

  async execute(userId: number): Promise<Promo[]> {
    const seller = await this.sellerRepository.findByUserId(
      userId,
    );

    if (!seller) {
      throw new SellerAccountRequiredError();
    }

    return this.promoRepository.findBySellerId(seller.id);
  }
}
