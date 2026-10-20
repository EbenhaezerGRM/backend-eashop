
import {
  Promo,
  PromoConfig,
} from '../entities/promo.entity';

import {
  PromoValidationResult,
} from './promo-validator';

import { DiscountCalculator } from './discount-calculator';

describe('DiscountCalculator', () => {
  let calculator: DiscountCalculator;

  // Konfigurasi dasar promo untuk pengujian.
  const basePromoConfig: PromoConfig = {
    id: 1,
    name: 'Diskon Platform 10%',
    source: 'PLATFORM',
    sellerId: null,

    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumPurchase: 0,
    maximumDiscount: null,

    isStackable: false,

    startsAt: new Date('2026-01-01T00:00:00Z'),
    endsAt: new Date('2026-02-01T00:00:00Z'),
  };

  // Membuat promo dengan konfigurasi yang dapat diubah.
  function createPromo(
    overrides: Partial<PromoConfig> = {},
  ): Promo {
    return new Promo({
      ...basePromoConfig,
      ...overrides,
    });
  }

  // Membuat hasil validasi yang menyatakan
  // bahwa promo memenuhi persyaratan.
  function validResult(
    subtotal: number,
  ): PromoValidationResult {
    return {
      isEligible: true,
      eligibleSubtotal: subtotal,
      reason: null,
    };
  }

  beforeEach(() => {
    calculator = new DiscountCalculator();
  });

  it('menghitung diskon persentase 10%', () => {
    const promo = createPromo({
      discountValue: 10,
    });

    const result = calculator.calculate(
      promo,
      validResult(500000),
    );

    expect(result).toBe(50000);
  });

  it('menerapkan batas maksimum diskon persentase', () => {
    const promo = createPromo({
      discountValue: 10,
      maximumDiscount: 25000,
    });

    const result = calculator.calculate(
      promo,
      validResult(500000),
    );

    expect(result).toBe(25000);
  });

  it('tidak membatasi diskon yang masih di bawah maksimum', () => {
    const promo = createPromo({
      discountValue: 10,
      maximumDiscount: 25000,
    });

    const result = calculator.calculate(
      promo,
      validResult(100000),
    );

    expect(result).toBe(10000);
  });

  it('menghitung diskon nominal tetap', () => {
    const promo = createPromo({
      discountType: 'FIXED',
      discountValue: 20000,
    });

    const result = calculator.calculate(
      promo,
      validResult(500000),
    );

    expect(result).toBe(20000);
  });

  it('menerapkan batas maksimum pada diskon nominal', () => {
    const promo = createPromo({
      discountType: 'FIXED',
      discountValue: 30000,
      maximumDiscount: 15000,
    });

    const result = calculator.calculate(
      promo,
      validResult(500000),
    );

    expect(result).toBe(15000);
  });

  it('membatasi diskon agar tidak melebihi subtotal', () => {
    const promo = createPromo({
      discountType: 'FIXED',
      discountValue: 50000,
    });

    const result = calculator.calculate(
      promo,
      validResult(20000),
    );

    expect(result).toBe(20000);
  });

  it('membulatkan diskon persentase ke bawah', () => {
    const promo = createPromo({
      discountValue: 12.5,
    });

    const result = calculator.calculate(
      promo,
      validResult(100001),
    );

    expect(result).toBe(12500);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('memberikan diskon 0 jika promo tidak memenuhi syarat', () => {
    const promo = createPromo({
      discountValue: 10,
    });

    const validation: PromoValidationResult = {
      isEligible: false,
      eligibleSubtotal: 500000,
      reason: 'MINIMUM_PURCHASE_NOT_MET',
    };

    const result = calculator.calculate(
      promo,
      validation,
    );

    expect(result).toBe(0);
  });

  it('menghitung diskon berdasarkan subtotal seller terkait', () => {
    const promo = createPromo({
      name: 'Diskon Seller 1',
      source: 'SELLER',
      sellerId: 1,
      discountValue: 10,
    });

    // Total keranjang sebenarnya Rp750.000.
    // Namun, produk Seller 1 hanya Rp500.000.
    const validation = validResult(500000);

    const result = calculator.calculate(
      promo,
      validation,
    );

    expect(result).toBe(50000);
  });
});
