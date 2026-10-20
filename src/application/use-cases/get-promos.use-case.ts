
import { Promo } from '../../domain/entities/promo.entity';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

export class GetPromosUseCase {
  constructor(
    private readonly promoRepository: PromoRepository,
  ) {}

  async execute(): Promise<Promo[]> {
    return this.promoRepository.findAll();
  }
}
