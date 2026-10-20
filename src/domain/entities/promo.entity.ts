export type PromoSource = 'SELLER' | 'PLATFORM';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type VoucherType = 'DISCOUNT' | 'FREE_SHIPPING';

export interface ShippingDiscountTier {
  minimumSubtotal: number;
  maximumShippingDiscount: number;
}

export interface PromoConfig {
  id: number;
  name: string;
  source: PromoSource;
  sellerId: number | null;

  voucherType: VoucherType;
  stock: number,

  discountType: DiscountType;
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount: number | null;
  shippingDiscountTiers: ShippingDiscountTier[] | null;

  isStackable: boolean;
  startsAt: Date;
  endsAt: Date;
}

export class Promo {
  constructor(
    public readonly config: PromoConfig,
  ) {
    this.validate();
  }

  private validate(): void {
    const promo = this.config;

    // Nama promo tidak boleh kosong.
    if (!promo.name.trim()) {
      throw new Error('Nama promo tidak boleh kosong');
    }

    // Diskon harus lebih besar dari nol.
    if (
      !Number.isFinite(promo.discountValue) ||
      promo.discountValue <= 0
    ) {
      throw new Error('Nilai diskon harus lebih besar dari 0');
    }

    // Persentase diskon maksimal 100%.
    if (
      promo.discountType === 'PERCENTAGE' &&
      promo.discountValue > 100
    ) {
      throw new Error(
        'Persentase diskon tidak boleh melebihi 100%',
      );
    }

    // Nominal diskon tetap harus bilangan bulat.
    if (
      promo.discountType === 'FIXED' &&
      !Number.isSafeInteger(promo.discountValue)
    ) {
      throw new Error(
        'Nominal diskon harus berupa bilangan bulat',
      );
    }

    // Minimum pembelian tidak boleh negatif.
    if (
      !Number.isSafeInteger(promo.minimumPurchase) ||
      promo.minimumPurchase < 0
    ) {
      throw new Error('Minimum pembelian tidak valid');
    }

    // Batas diskon, jika digunakan, harus positif.
    if (
      promo.maximumDiscount !== null &&
      (
        !Number.isSafeInteger(promo.maximumDiscount) ||
        promo.maximumDiscount <= 0
      )
    ) {
      throw new Error('Batas maksimum diskon tidak valid');
    }


    // Promo seller harus mempunyai identitas seller.
    if (
      promo.source === 'SELLER' &&
      (
        promo.sellerId === null ||
        !Number.isSafeInteger(promo.sellerId) ||
        promo.sellerId <= 0
      )
    ) {
      throw new Error(
        'Promo seller harus memiliki sellerId yang valid',
      );
    }

    // Promo platform tidak terkait dengan seller tertentu.
    if (
      promo.source === 'PLATFORM' &&
      promo.sellerId !== null
    ) {
      throw new Error(
        'Promo platform tidak boleh memiliki sellerId',
      );
    }

    // Periksa periode berlakunya promo.
    if (
      Number.isNaN(promo.startsAt.getTime()) ||
      Number.isNaN(promo.endsAt.getTime()) ||
      promo.startsAt >= promo.endsAt
    ) {
      throw new Error('Periode promo tidak valid');
    }

    // Tier subsidi ongkir hanya boleh ada pada promo free shipping.
    if (promo.voucherType === 'DISCOUNT') {
      if (promo.shippingDiscountTiers !== null) {
        throw new Error(
          'Promo diskon produk tidak boleh memiliki tier subsidi ongkir',
        );
      }
    }

    if (promo.voucherType === 'FREE_SHIPPING') {
      if (
        !Array.isArray(promo.shippingDiscountTiers) ||
        promo.shippingDiscountTiers.length === 0
      ) {
        throw new Error(
          'Promo free shipping harus memiliki tier subsidi ongkir',
        );
      }

      let previousMinimumSubtotal = -1;

      for (const tier of promo.shippingDiscountTiers) {
        if (
          !Number.isSafeInteger(tier.minimumSubtotal) ||
          tier.minimumSubtotal < 0
        ) {
          throw new Error(
            'Minimum subtotal tier harus berupa bilangan bulat non-negatif',
          );
        }

        if (
          !Number.isSafeInteger(tier.maximumShippingDiscount) ||
          tier.maximumShippingDiscount <= 0
        ) {
          throw new Error(
            'Maksimum subsidi ongkir harus berupa bilangan bulat positif',
          );
        }

        if (tier.minimumSubtotal <= previousMinimumSubtotal) {
          throw new Error(
            'Minimum subtotal tier harus berurutan naik dan tidak duplikat',
          );
        }

        previousMinimumSubtotal = tier.minimumSubtotal;
      }
    }
  }

  isActive(at: Date): boolean {
    return (
      at >= this.config.startsAt &&
      at < this.config.endsAt
    );
  }
}
