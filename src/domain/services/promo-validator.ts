import { Promo } from '../entities/promo.entity';
import { Cart } from '../entities/cart.entity';

export type PromoValidationReason =
  | 'NOT_ACTIVE'
  | 'OUT_OF_STOCK'
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

    // Periksa stok promo.
  if (promo.config.stock <= 0) {
    return {
      isEligible: false,
      eligibleSubtotal: 0,
      reason: 'OUT_OF_STOCK',
    };
  }
  
  // Semua jenis promo harus masih aktif.
  if (!promo.isActive(evaluationDate)) {
    return {
      isEligible: false,
      eligibleSubtotal: 0,
      reason: 'NOT_ACTIVE',
    };
  }

  // Voucher gratis ongkir memakai subtotal seluruh cart,
  // sebelum diskon produk.
  if (promo.config.voucherType === 'FREE_SHIPPING') {
    const cartSubtotal = cart.getTotal();

    if (cartSubtotal < promo.config.minimumPurchase) {
      return {
        isEligible: false,
        eligibleSubtotal: cartSubtotal,
        reason: 'MINIMUM_PURCHASE_NOT_MET',
      };
    }

    return {
      isEligible: true,
      eligibleSubtotal: cartSubtotal,
      reason: null,
    };
  }

  // Promo DISCOUNT: cakupan produk tetap seller/platform.
  const items = cart.getItems();

  const eligibleItems =
    promo.config.source === 'PLATFORM'
      ? items
      : items.filter(
          (item) =>
            item.product.sellerId === promo.config.sellerId,
        );

  const eligibleSubtotal = eligibleItems.reduce(
    (total, item) => total + item.getSubtotal(),
    0,
  );

  if (eligibleItems.length === 0) {
    return {
      isEligible: false,
      eligibleSubtotal,
      reason: 'NO_ELIGIBLE_PRODUCTS',
    };
  }

  if (eligibleSubtotal < promo.config.minimumPurchase) {
    return {
      isEligible: false,
      eligibleSubtotal,
      reason: 'MINIMUM_PURCHASE_NOT_MET',
    };
  }

  return {
    isEligible: true,
    eligibleSubtotal,
    reason: null,
  };
}
}
