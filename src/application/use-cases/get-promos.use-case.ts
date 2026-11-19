import { Promo, type PromoSource } from
  '../../domain/entities/promo.entity';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

export class GetPromosUseCase {
  constructor(
    private readonly promoRepository: PromoRepository,
  ) {}

  // Mengambil semua promo.
  async execute(): Promise<Promo[]> {
    return this.promoRepository.findAll();
  }

  // Mengambil promo berdasarkan sellerId.
  async executeBySellerId(
    sellerId: number,
  ): Promise<Promo[]> {
    return this.promoRepository.findBySellerId(sellerId);
  }

  // Mengambil promo berdasarkan source.
  async executeBySource(
    source: PromoSource,
  ): Promise<Promo[]> {
    return this.promoRepository.findBySource(source);
  }
}