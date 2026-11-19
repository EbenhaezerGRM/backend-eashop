import {
  Promo,
  PromoConfig,
} from '../../domain/entities/promo.entity';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { SellerRepository } from
  '../../domain/repositories/seller.repository';

import { InvalidPromoInputError } from
  '../../domain/errors/promo.errors';

import { SellerAccountRequiredError } from
  '../../domain/errors/seller.errors';

export type CreatePromoInput = Omit<
  PromoConfig,
  'id' | 'source' | 'sellerId'
>;

export class CreatePromoUseCase {
  constructor(
    private readonly promoRepository: PromoRepository,
    private readonly sellerRepository: SellerRepository,
  ) {}

  async execute(
    data: CreatePromoInput,
    userId: number,
  ): Promise<Promo> {
    const seller = await this.sellerRepository.findByUserId(userId);

    if (!seller) {
      throw new SellerAccountRequiredError();
    }

    let promo: Promo;

    try {
      promo = new Promo({
        id: 0,
        ...data,
        source: 'SELLER',
        sellerId: seller.id,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidPromoInputError(error.message);
      }

      throw error;
    }

    return this.promoRepository.create(promo);
  }
}
