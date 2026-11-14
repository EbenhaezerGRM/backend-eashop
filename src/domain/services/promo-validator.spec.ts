
import { Promo, PromoConfig } from
  '../entities/promo.entity';

import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';

import { PromoValidator } from './promo-validator';

describe('PromoValidator', () => {
  let validator: PromoValidator;
  let cart: Cart;

  const evaluationDate =
    new Date('2026-01-15T12:00:00Z');

  // Konfigurasi dasar promo.
  const basePromoConfig: PromoConfig = {
    id: 1,
    name: 'Diskon Platform 10%',
    source: 'PLATFORM',
    sellerId: null,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumPurchase: 600000,
    maximumDiscount: 25000,
    stock: 2,
voucherType: 'DISCOUNT',
shippingDiscountTiers: null,
    isStackable: true,
    startsAt: new Date('2026-01-01T00:00:00Z'),
    endsAt: new Date('2026-02-01T00:00:00Z'),
  };

  // Helper untuk membuat promo.
  function createPromo(
    overrides: Partial<PromoConfig> = {},
  ): Promo {
    return new Promo({
      ...basePromoConfig,
      ...overrides,
    });
  }

  beforeEach(() => {
    validator = new PromoValidator();

    // Produk milik Seller 1.
    const sneakers = new Product(
      1,
      'Sepatu Sneakers',
      'Sepatu nyaman',
      500000,
      'Fashion',
      15,
      1,
    );

    // Produk milik Seller 2.
    const bag = new Product(
      2,
      'Tas Wanita',
      'Tas elegan',
      250000,
      'Fashion',
      20,
      2,
    );

    cart = new Cart(1, 100);

    cart.addItem(new CartItem(sneakers, 1));
    cart.addItem(new CartItem(bag, 1));
  });

  it('menolak promo seller jika minimum belum terpenuhi', () => {
    const promo = createPromo({
      source: 'SELLER',
      sellerId: 1,
      minimumPurchase: 600000,
    });

    const result = validator.evaluate(
      promo,
      cart,
      evaluationDate,
    );

    expect(result).toEqual({
      isEligible: false,
      eligibleSubtotal: 500000,
      reason: 'MINIMUM_PURCHASE_NOT_MET',
    });
  });

  it('menerima promo seller tepat pada minimum pembelian', () => {
    const promo = createPromo({
      source: 'SELLER',
      sellerId: 1,
      minimumPurchase: 500000,
    });

    const result = validator.evaluate(
      promo,
      cart,
      evaluationDate,
    );

    expect(result).toEqual({
      isEligible: true,
      eligibleSubtotal: 500000,
      reason: null,
    });
  });

  it('menerima promo platform jika minimum terpenuhi', () => {
    const promo = createPromo({
      minimumPurchase: 600000,
    });

    const result = validator.evaluate(
      promo,
      cart,
      evaluationDate,
    );

    expect(result).toEqual({
      isEligible: true,
      eligibleSubtotal: 750000,
      reason: null,
    });
  });

  it('menolak promo platform jika minimum belum terpenuhi', () => {
    const promo = createPromo({
      minimumPurchase: 800000,
    });

    const result = validator.evaluate(
      promo,
      cart,
      evaluationDate,
    );

    expect(result).toEqual({
      isEligible: false,
      eligibleSubtotal: 750000,
      reason: 'MINIMUM_PURCHASE_NOT_MET',
    });
  });

  it('hanya menghitung produk milik seller yang sesuai', () => {
    const promo = createPromo({
      source: 'SELLER',
      sellerId: 2,
      minimumPurchase: 200000,
    });

    const result = validator.evaluate(
      promo,
      cart,
      evaluationDate,
    );

    expect(result.isEligible).toBe(true);
    expect(result.eligibleSubtotal).toBe(250000);
    expect(result.reason).toBeNull();
  });

  it('menolak promo seller jika tidak ada produk yang sesuai', () => {
    const promo = createPromo({
      source: 'SELLER',
      sellerId: 3,
      minimumPurchase: 0,
    });

    const result = validator.evaluate(
      promo,
      cart,
      evaluationDate,
    );

    expect(result).toEqual({
      isEligible: false,
      eligibleSubtotal: 0,
      reason: 'NO_ELIGIBLE_PRODUCTS',
    });
  });

  it('menolak promo yang belum dimulai', () => {
    const promo = createPromo();

    const result = validator.evaluate(
      promo,
      cart,
      new Date('2025-12-31T12:00:00Z'),
    );

    expect(result.isEligible).toBe(false);
    expect(result.reason).toBe('NOT_ACTIVE');
  });

  it('menolak promo tepat saat periode berakhir', () => {
    const promo = createPromo();

    const result = validator.evaluate(
      promo,
      cart,
      new Date('2026-02-01T00:00:00Z'),
    );

    expect(result.isEligible).toBe(false);
    expect(result.reason).toBe('NOT_ACTIVE');
  });

  it('menolak promo jika keranjang kosong', () => {
    const emptyCart = new Cart(2, 100);

    const promo = createPromo({
      minimumPurchase: 0,
    });

    const result = validator.evaluate(
      promo,
      emptyCart,
      evaluationDate,
    );

    expect(result).toEqual({
      isEligible: false,
      eligibleSubtotal: 0,
      reason: 'NO_ELIGIBLE_PRODUCTS',
    });
  });
});
