
import {
  Promo,
  PromoConfig,
} from '../entities/promo.entity';

import { Product } from '../entities/product.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';

import { PromoValidator } from './promo-validator';

import { DiscountCalculator } from
  './discount-calculator';

import { PromoEvaluationService } from
  './promo-evaluation.service';

import { InvalidPromoCombinationError } from
  '../errors/promo.errors';

describe('PromoEvaluationService', () => {
  let service: PromoEvaluationService;
  let cart: Cart;

  // Tanggal tetap agar pengujian tidak bergantung
  // pada tanggal saat Jest dijalankan.
  const evaluationDate =
    new Date('2026-01-15T12:00:00Z');

  // Konfigurasi dasar untuk promo platform.
  const baseConfig: PromoConfig = {
    id: 2,
    name: 'Promo Platform',
    source: 'PLATFORM',
    sellerId: null,
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumPurchase: 0,
    maximumDiscount: null,
    isStackable: true,
    startsAt: new Date('2026-01-01T00:00:00Z'),
    endsAt: new Date('2026-02-01T00:00:00Z'),
  };

  // Helper untuk membuat promo seller.
  function sellerPromo(
    overrides: Partial<PromoConfig> = {},
  ): Promo {
    return new Promo({
      ...baseConfig,
      id: 1,
      name: 'Promo Seller 1',
      source: 'SELLER',
      sellerId: 1,
      ...overrides,
    });
  }

  // Helper untuk membuat promo platform.
  function platformPromo(
    overrides: Partial<PromoConfig> = {},
  ): Promo {
    return new Promo({
      ...baseConfig,
      ...overrides,
    });
  }

  beforeEach(() => {
    service = new PromoEvaluationService(
      new PromoValidator(),
      new DiscountCalculator(),
    );

    // Produk Seller 1.
    const sneakers = new Product(
      1,
      'Sepatu Sneakers',
      'Sepatu untuk aktivitas sehari-hari',
      500000,
      'Fashion',
      15,
      1,
    );

    // Produk Seller 2.
    const bag = new Product(
      2,
      'Tas Wanita',
      'Tas wanita elegan',
      250000,
      'Fashion',
      20,
      2,
    );

    // Total keranjang Rp750.000.
    cart = new Cart(1, 100);

    cart.addItem(new CartItem(sneakers, 1));
    cart.addItem(new CartItem(bag, 1));
  });

  it('tidak mengubah total jika tidak ada promo', () => {
    const result = service.evaluate(
      cart,
      [],
      evaluationDate,
    );

    expect(result.originalTotal).toBe(750000);
    expect(result.totalDiscount).toBe(0);
    expect(result.finalTotal).toBe(750000);
    expect(result.promos).toHaveLength(0);
  });

  it('menghitung satu promo seller', () => {
    const result = service.evaluate(
      cart,
      [sellerPromo()],
      evaluationDate,
    );

    expect(result.originalTotal).toBe(750000);
    expect(result.totalDiscount).toBe(50000);
    expect(result.finalTotal).toBe(700000);

    expect(result.promos[0].eligibleSubtotal)
      .toBe(500000);
  });

  it('menghitung satu promo platform', () => {
    const result = service.evaluate(
      cart,
      [platformPromo()],
      evaluationDate,
    );

    expect(result.totalDiscount).toBe(75000);
    expect(result.finalTotal).toBe(675000);
  });

  it('menghitung promo seller sebelum platform', () => {
    const result = service.evaluate(
      cart,
      [
        sellerPromo(),
        platformPromo(),
      ],
      evaluationDate,
    );

    // Seller: 10% x Rp500.000 = Rp50.000.
    expect(result.promos[0].source).toBe('SELLER');
    expect(result.promos[0].discount).toBe(50000);

    // Platform: 10% x Rp700.000 = Rp70.000.
    expect(result.promos[1].source).toBe('PLATFORM');

    expect(result.promos[1].eligibleSubtotal)
      .toBe(750000);

    expect(result.promos[1].calculationSubtotal)
      .toBe(700000);

    expect(result.promos[1].discount).toBe(70000);

    // Total setelah kedua diskon.
    expect(result.totalDiscount).toBe(120000);
    expect(result.finalTotal).toBe(630000);
  });

  it('menghasilkan hasil sama walaupun urutan promo dibalik', () => {
    const firstResult = service.evaluate(
      cart,
      [
        sellerPromo(),
        platformPromo(),
      ],
      evaluationDate,
    );

    const secondResult = service.evaluate(
      cart,
      [
        platformPromo(),
        sellerPromo(),
      ],
      evaluationDate,
    );

    expect(secondResult).toEqual(firstResult);
  });

  it('memeriksa minimum platform dari total awal', () => {
    const result = service.evaluate(
      cart,
      [
        sellerPromo(),
        platformPromo({
          minimumPurchase: 720000,
        }),
      ],
      evaluationDate,
    );

    // Total awal Rp750.000 memenuhi minimum.
    expect(result.promos[1].isEligible).toBe(true);

    expect(result.promos[1].eligibleSubtotal)
      .toBe(750000);

    // Diskon tetap dihitung setelah diskon seller.
    expect(result.promos[1].calculationSubtotal)
      .toBe(700000);

    expect(result.promos[1].discount).toBe(70000);
  });

  it('tetap menggunakan platform jika seller tidak memenuhi syarat', () => {
    const result = service.evaluate(
      cart,
      [
        sellerPromo({
          minimumPurchase: 600000,
        }),
        platformPromo(),
      ],
      evaluationDate,
    );

    expect(result.promos[0].isEligible).toBe(false);

    expect(result.promos[0].reason)
      .toBe('MINIMUM_PURCHASE_NOT_MET');

    expect(result.promos[0].discount).toBe(0);

    // Karena seller tidak mendapatkan diskon,
    // platform menggunakan total Rp750.000.
    expect(result.promos[1].discount).toBe(75000);

    expect(result.totalDiscount).toBe(75000);
    expect(result.finalTotal).toBe(675000);
  });

  it('tetap menggunakan seller jika platform tidak memenuhi syarat', () => {
    const result = service.evaluate(
      cart,
      [
        sellerPromo(),
        platformPromo({
          minimumPurchase: 800000,
        }),
      ],
      evaluationDate,
    );

    expect(result.promos[0].discount).toBe(50000);

    expect(result.promos[1].isEligible).toBe(false);
    expect(result.promos[1].discount).toBe(0);

    expect(result.totalDiscount).toBe(50000);
    expect(result.finalTotal).toBe(700000);
  });

  it('menolak kombinasi jika salah satu promo tidak stackable', () => {
    expect(() =>
      service.evaluate(
        cart,
        [
          sellerPromo({
            isStackable: false,
          }),
          platformPromo(),
        ],
        evaluationDate,
      ),
    ).toThrow(InvalidPromoCombinationError);
  });

  it('menolak dua promo dari sumber yang sama', () => {
    expect(() =>
      service.evaluate(
        cart,
        [
          sellerPromo(),
          sellerPromo({
            id: 3,
            sellerId: 2,
          }),
        ],
        evaluationDate,
      ),
    ).toThrow(InvalidPromoCombinationError);
  });

  it('menolak penggunaan lebih dari dua promo', () => {
    expect(() =>
      service.evaluate(
        cart,
        [
          sellerPromo(),
          platformPromo(),
          sellerPromo({
            id: 3,
            sellerId: 2,
          }),
        ],
        evaluationDate,
      ),
    ).toThrow(InvalidPromoCombinationError);
  });
});
