
import { Promo } from '../entities/promo.entity';

import type {
  PromoValidationResult,
} from './promo-validator';

export class DiscountCalculator {
  calculate(
    promo: Promo,
    validation: PromoValidationResult,
  ): number {

    // 1. Promo yang tidak memenuhi syarat
    // tidak mendapatkan diskon.
    if (!validation.isEligible) {
      return 0;
    }

    // 2. Ambil subtotal yang memenuhi
    // cakupan promo.
    const subtotal = validation.eligibleSubtotal;

    // 3. Hitung nominal diskon awal.
    let discount: number;

    if (promo.config.discountType === 'PERCENTAGE') {
      discount = Math.floor(
        (subtotal * promo.config.discountValue) / 100,
      );

    } else {
      discount = promo.config.discountValue;
    }

    // 4. Terapkan batas maksimum diskon,
    // apabila tersedia.
    if (promo.config.maximumDiscount !== null) {
      discount = Math.min(
        discount,
        promo.config.maximumDiscount,
      );
    }

    // 5. Diskon tidak boleh melebihi
    // subtotal produk yang memenuhi cakupan.
    return Math.min(
      discount,
      subtotal,
    );
  }
}
