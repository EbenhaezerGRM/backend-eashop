import {
  Promo,
  PromoSource,
} from '../entities/promo.entity';

import { Cart } from '../entities/cart.entity';

import {
  PromoValidator,
  PromoValidationReason,
} from './promo-validator';

import { DiscountCalculator } from
  './discount-calculator';

import { InvalidPromoCombinationError } from
  '../errors/promo.errors';

export interface AppliedPromoResult {
  promoId: number;
  source: PromoSource;

  isEligible: boolean;
  reason: PromoValidationReason | null;

  eligibleSubtotal: number;
  calculationSubtotal: number;
  discount: number;
}

export interface PromoEvaluationResult {
  originalTotal: number;
  totalDiscount: number;
  finalTotal: number;
  promos: AppliedPromoResult[];
}

export class PromoEvaluationService {
  constructor(
    private readonly validator: PromoValidator,
    private readonly calculator: DiscountCalculator,
  ) {}

  evaluate(
    cart: Cart,
    promos: Promo[],
    evaluationDate: Date,
  ): PromoEvaluationResult {

    // 1. Pastikan kombinasi promo diperbolehkan.
    this.validateCombination(promos);

    // 2. Tetapkan urutan:
    // SELLER terlebih dahulu, lalu PLATFORM.
    const orderedPromos = [...promos].sort(
      (a, b) => {
        if (a.config.source === b.config.source) {
          return 0;
        }

        return a.config.source === 'SELLER'
          ? -1
          : 1;
      },
    );

    const results: AppliedPromoResult[] = [];

    const originalTotal = cart.getTotal();

    let sellerDiscount = 0;
    let totalDiscount = 0;

    // 3. Evaluasi setiap promo secara berurutan.
    for (const promo of orderedPromos) {

      // Periksa periode, seller, dan minimum
      // pembelian berdasarkan data awal Cart.
      const validation = this.validator.evaluate(
        promo,
        cart,
        evaluationDate,
      );

      // 4. Platform mendapatkan dasar perhitungan
      // setelah dikurangi diskon seller.
      const calculationSubtotal =
        promo.config.source === 'PLATFORM'
          ? Math.max(
              0,
              validation.eligibleSubtotal - sellerDiscount,
            )
          : validation.eligibleSubtotal;

      // 5. Hitung diskon berdasarkan hasil validasi.
      const discount = this.calculator.calculate(
        promo,
        {
          ...validation,
          eligibleSubtotal: calculationSubtotal,
        },
      );

      // 6. Simpan diskon seller agar dapat
      // digunakan saat menghitung promo platform.
      if (promo.config.source === 'SELLER') {
        sellerDiscount = discount;
      }

      totalDiscount += discount;

      // 7. Simpan rincian hasil setiap promo.
      results.push({
        promoId: promo.config.id,
        source: promo.config.source,
        isEligible: validation.isEligible,
        reason: validation.reason,
        eligibleSubtotal: validation.eligibleSubtotal,
        calculationSubtotal,
        discount,
      });
    }

    // 8. Hitung total transaksi.
    return {
      originalTotal,
      totalDiscount,
      finalTotal: Math.max(
        0,
        originalTotal - totalDiscount,
      ),
      promos: results,
    };
  }

  private validateCombination(
  promos: Promo[],
  ): void {
  if (promos.length > 2) {
    throw new InvalidPromoCombinationError(
      'Maksimal dua promo dapat digunakan',
    );
  }

  if (promos.length < 2) {
    return;
  }

  const [first, second] = promos;

  const firstConfig = first.config;
  const secondConfig = second.config;

  // Dua voucher free shipping tidak boleh digabung.
  if (
    firstConfig.voucherType === 'FREE_SHIPPING' &&
    secondConfig.voucherType === 'FREE_SHIPPING'
  ) {
    throw new InvalidPromoCombinationError(
      'Dua voucher gratis ongkir tidak dapat digabung',
    );
  }

  // Dua voucher platform hanya boleh digabung
  // jika keduanya stackable.
  if (
    firstConfig.source === 'PLATFORM' &&
    secondConfig.source === 'PLATFORM' &&
    (!firstConfig.isStackable || !secondConfig.isStackable)
  ) {
    throw new InvalidPromoCombinationError(
      'Dua promo platform hanya dapat digabung jika keduanya stackable',
    );
  }

  // Dua voucher seller dari seller yang sama:
  // jika salah satunya non-stackable, kombinasi ditolak.
  if (
    firstConfig.source === 'SELLER' &&
    secondConfig.source === 'SELLER' &&
    firstConfig.sellerId === secondConfig.sellerId &&
    (!firstConfig.isStackable || !secondConfig.isStackable)
  ) {
    throw new InvalidPromoCombinationError(
      'Promo seller yang sama tidak dapat digabung jika ada yang non-stackable',
    );
  }
}
}
