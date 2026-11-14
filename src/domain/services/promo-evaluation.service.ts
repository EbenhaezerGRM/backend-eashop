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
  shippingDiscount: number;
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
    shippingCost = 0,
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

    let shippingDiscount = 0;

    // 3. Evaluasi setiap promo secara berurutan.
    for (const promo of orderedPromos) {

      // Periksa periode, seller, dan minimum
      // pembelian berdasarkan data awal Cart.
      const validation = this.validator.evaluate(
        promo,
        cart,
        evaluationDate,
      );

if (promo.config.voucherType === 'FREE_SHIPPING') {
  let discount = 0;

  if (validation.isEligible) {
    const cartSubtotal = cart.getTotal();

    const matchingTier =
      promo.config.shippingDiscountTiers
        ?.filter(
          (tier) =>
            cartSubtotal >= tier.minimumSubtotal,
        )
        .sort(
          (a, b) =>
            b.minimumSubtotal - a.minimumSubtotal,
        )[0];

    const tierCap =
      matchingTier?.maximumShippingDiscount ?? 0;

    discount = Math.min(
      Math.max(0, shippingCost),
      tierCap,
    );

    shippingDiscount = discount;
  }

  results.push({
    promoId: promo.config.id,
    source: promo.config.source,
    isEligible: validation.isEligible,
    reason: validation.reason,
    eligibleSubtotal: validation.eligibleSubtotal,
    calculationSubtotal: validation.eligibleSubtotal,
    discount,
  });

  // Subsidi ongkir tidak dihitung sebagai diskon produk.
  continue;
}

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
      shippingDiscount,
      finalTotal: Math.max(
        0,
        originalTotal - totalDiscount,
      ),
      promos: results,
    };
  }

  private validateCombination(promos: Promo[]): void {
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

  // Dua voucher gratis ongkir tidak boleh digabung.
  if (
    firstConfig.voucherType === 'FREE_SHIPPING' &&
    secondConfig.voucherType === 'FREE_SHIPPING'
  ) {
    throw new InvalidPromoCombinationError(
      'Dua voucher gratis ongkir tidak dapat digabung',
    );
  }

  // Dua promo dari sumber yang sama tidak boleh digabung.
    // Kombinasi FREE_SHIPPING + DISCOUNT diperbolehkan,
  // meskipun keduanya berasal dari sumber yang sama.
  const hasFreeShipping =
    firstConfig.voucherType === 'FREE_SHIPPING' ||
    secondConfig.voucherType === 'FREE_SHIPPING';

  if (hasFreeShipping) {
    // Sudah ditolak di atas jika keduanya FREE_SHIPPING.
    // Jadi pasangan yang tersisa adalah FREE_SHIPPING + DISCOUNT.
    return;
  }

  // Untuk dua promo DISCOUNT, sumber harus berbeda.
  if (firstConfig.source === secondConfig.source) {
    throw new InvalidPromoCombinationError(
      'Dua promo diskon dari sumber yang sama tidak dapat digabung',
    );
  }

  // Seller + platform: keduanya harus stackable.
  const sellerPromo =
    firstConfig.source === 'SELLER'
      ? firstConfig
      : secondConfig;

  const platformPromo =
    firstConfig.source === 'PLATFORM'
      ? firstConfig
      : secondConfig;

  if (
    !sellerPromo.isStackable ||
    !platformPromo.isStackable
  ) {
    throw new InvalidPromoCombinationError(
      'Promo seller dan platform hanya dapat digabung jika keduanya stackable',
    );
  }
}
}
