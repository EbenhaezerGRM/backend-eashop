
import {
  Promo,
  PromoConfig,
} from '../../domain/entities/promo.entity';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { InvalidPromoInputError } from
  '../../domain/errors/promo.errors';

export type CreatePromoInput = Omit<PromoConfig, 'id'>;

export class CreatePromoUseCase {
  constructor(
    private readonly promoRepository: PromoRepository,
  ) {}

  async execute(data: CreatePromoInput): Promise<Promo> {
    let promo: Promo;

    // Validasi aturan bisnis sebelum menyimpan promo.
    try {
      promo = new Promo({
        id: 0,
        ...data,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidPromoInputError(error.message);
      }

      throw error;
    }

    // Repository akan membuat ID asli di PostgreSQL.
    return this.promoRepository.create(promo);
  }
}
