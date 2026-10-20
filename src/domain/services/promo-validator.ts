import { Promo } from '../entities/promo.entity';
import { Cart } from '../entities/cart.entity';

export type PromoValidationReason =
  | 'NOT_ACTIVE'
  | 'NO_ELIGIBLE_PRODUCTS'
  | 'MINIMUM_PURCHASE_NOT_MET';

export interface PromoValidationResult {
  isEligible: boolean;
  eligibleSubtotal: number;
  reason: PromoValidationReason | null;
}

export class PromoValidator {
  evaluate(
    promo: Promo,
    cart: Cart,
    evaluationDate: Date,
  ): PromoValidationResult {

    // 1. Periksa periode berlaku promo.
    if (!promo.isActive(evaluationDate)) {
      return {
        isEligible: false,
        eligibleSubtotal: 0,
        reason: 'NOT_ACTIVE',
      };
    }

    // 2. Ambil seluruh produk dari keranjang.
    const items = cart.getItems();

    // 3. Tentukan produk yang memenuhi cakupan promo.
    const eligibleItems =
      promo.config.source === 'PLATFORM'
        ? items
        : items.filter(
            (item) =>
              item.product.sellerId ===
              promo.config.sellerId,
          );

    // 4. Hitung subtotal produk yang memenuhi cakupan.
    const eligibleSubtotal = eligibleItems.reduce(
      (total, item) => total + item.getSubtotal(),
      0,
    );

    // 5. Pastikan ada produk yang memenuhi cakupan.
    if (eligibleItems.length === 0) {
      return {
        isEligible: false,
        eligibleSubtotal,
        reason: 'NO_ELIGIBLE_PRODUCTS',
      };
    }

    // 6. Periksa minimum pembelian.
    if (
      eligibleSubtotal < promo.config.minimumPurchase
    ) {
      return {
        isEligible: false,
        eligibleSubtotal,
        reason: 'MINIMUM_PURCHASE_NOT_MET',
      };
    }

    // 7. Semua persyaratan awal terpenuhi.
    return {
      isEligible: true,
      eligibleSubtotal,
      reason: null,
    };
  }
}
