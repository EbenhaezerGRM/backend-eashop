import { CartRepository } from
  '../../domain/repositories/cart.repository';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import {
  PromoEvaluationService,
  PromoEvaluationResult,
} from '../../domain/services/promo-evaluation.service';

import { CartNotFoundError } from
  '../../domain/errors/cart.errors';

import {
  PromoNotFoundError,
  InvalidPromoSelectionError,
} from '../../domain/errors/promo.errors';

export interface ApplyPromoInput {
  cartId: number;
  promoIds: number[];
  evaluationDate: Date;
}

export class ApplyPromoUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly promoRepository: PromoRepository,
    private readonly promoEvaluationService:
      PromoEvaluationService,
  ) {}

  async execute(
    data: ApplyPromoInput,
  ): Promise<PromoEvaluationResult> {

    // 1. Validasi jumlah promo.
    if (
      data.promoIds.length < 1 ||
      data.promoIds.length > 2
    ) {
      throw new InvalidPromoSelectionError(
        'Promo yang dipilih harus berjumlah 1 atau 2',
      );
    }

    // 2. Pastikan seluruh ID promo valid.
    const hasInvalidId = data.promoIds.some(
      (id) =>
        !Number.isSafeInteger(id) ||
        id <= 0,
    );

    if (hasInvalidId) {
      throw new InvalidPromoSelectionError(
        'ID promo tidak valid',
      );
    }

    // 3. Jangan izinkan ID promo yang sama dipilih dua kali.
    const uniquePromoIds =
      new Set(data.promoIds);

    if (
      uniquePromoIds.size !==
      data.promoIds.length
    ) {
      throw new InvalidPromoSelectionError(
        'Promo yang sama tidak boleh dipilih lebih dari satu kali',
      );
    }

    // 4. Ambil Cart.
    const cart =
      await this.cartRepository.findById(
        data.cartId,
      );

    if (!cart) {
      throw new CartNotFoundError();
    }

    // 5. Ambil promo dari repository.
    const promos =
      await this.promoRepository.findByIds(
        data.promoIds,
      );

    // 6. Pastikan semua promo yang diminta ditemukan.
    if (
      promos.length !==
      data.promoIds.length
    ) {
      throw new PromoNotFoundError();
    }

    // 7. Jalankan evaluasi menggunakan
    // service domain yang sudah kita buat.
    return this.promoEvaluationService.evaluate(
      cart,
      promos,
      data.evaluationDate,
    );
  }
}