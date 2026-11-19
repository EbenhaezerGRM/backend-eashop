import { PromoRepository } from '../../domain/repositories/promo.repository';
import { SellerRepository } from '../../domain/repositories/seller.repository';
import { SellerAccountRequiredError } from '../../domain/errors/seller.errors';
import { SellerPromoNotFoundError } from '../../domain/errors/seller-promo.errors';

export class DeleteSellerPromoUseCase {
  constructor(
    private readonly sellerRepository: SellerRepository,
    private readonly promoRepository: PromoRepository,
  ) {}

  async execute(
    userId: number,
    promoId: number,
  ): Promise<{ id: number }> {
    const seller = await this.sellerRepository.findByUserId(userId);

    if (!seller) {
      throw new SellerAccountRequiredError();
    }

    const deleted = await this.promoRepository.deleteByIdAndSellerId(
      promoId,
      seller.id,
    );

    if (!deleted) {
      throw new SellerPromoNotFoundError();
    }

    return { id: promoId };
  }
}