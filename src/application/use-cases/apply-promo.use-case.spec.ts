import { ApplyPromoUseCase } from
  './apply-promo.use-case';

import { Cart } from
  '../../domain/entities/cart.entity';

import { CartItem } from
  '../../domain/entities/cart-item.entity';

import { Product } from
  '../../domain/entities/product.entity';

import {
  Promo,
  PromoConfig,
} from '../../domain/entities/promo.entity';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { PromoValidator } from
  '../../domain/services/promo-validator';

import { DiscountCalculator } from
  '../../domain/services/discount-calculator';

import { PromoEvaluationService } from
  '../../domain/services/promo-evaluation.service';

import { CartNotFoundError } from
  '../../domain/errors/cart.errors';

import {
  PromoNotFoundError,
  InvalidPromoSelectionError,
} from '../../domain/errors/promo.errors';

describe('ApplyPromoUseCase', () => {
  let useCase: ApplyPromoUseCase;

  let mockCartRepository: jest.Mocked<CartRepository>;
  let mockPromoRepository: jest.Mocked<PromoRepository>;

  let cart: Cart;
  let sellerPromo: Promo;
  let platformPromo: Promo;

  const evaluationDate =
    new Date('2026-10-01T12:00:00Z');

  beforeEach(() => {
    // =========================
    // PRODUCT SELLER 1
    // =========================
    const sneakers = new Product(
      1,
      'Sepatu Sneakers',
      'Sepatu nyaman',
      500000,
      'Fashion',
      15,
      1,
    );

    // =========================
    // PRODUCT SELLER 2
    // =========================
    const bag = new Product(
      2,
      'Tas Wanita',
      'Tas elegan',
      250000,
      'Fashion',
      20,
      2,
    );

    // Total cart = Rp750.000
    cart = new Cart(1, 100);

    cart.addItem(
      new CartItem(sneakers, 1),
    );

    cart.addItem(
      new CartItem(bag, 1),
    );

    // =========================
    // PROMO SELLER
    // =========================
    const sellerConfig: PromoConfig = {
      id: 1,
      name: 'Diskon Seller 10%',
      source: 'SELLER',
      sellerId: 1,

      discountType: 'PERCENTAGE',
      discountValue: 10,

      minimumPurchase: 100000,
      maximumDiscount: null,

      isStackable: true,

      startsAt:
        new Date('2026-09-01T00:00:00Z'),

      endsAt:
        new Date('2026-12-31T23:59:59Z'),
    };

    sellerPromo = new Promo(sellerConfig);

    // =========================
    // PROMO PLATFORM
    // =========================
    const platformConfig: PromoConfig = {
      id: 2,
      name: 'Diskon Platform 10%',
      source: 'PLATFORM',
      sellerId: null,

      discountType: 'PERCENTAGE',
      discountValue: 10,

      minimumPurchase: 100000,
      maximumDiscount: null,

      isStackable: true,

      startsAt:
        new Date('2026-09-01T00:00:00Z'),

      endsAt:
        new Date('2026-12-31T23:59:59Z'),
    };

    platformPromo = new Promo(platformConfig);

    // =========================
    // MOCK CART REPOSITORY
    // =========================
    mockCartRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
    };

    // =========================
    // MOCK PROMO REPOSITORY
    // =========================
    mockPromoRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn(),
    };

    mockCartRepository.findById
      .mockResolvedValue(cart);

    // Gunakan service domain asli.
    const promoEvaluationService =
      new PromoEvaluationService(
        new PromoValidator(),
        new DiscountCalculator(),
      );

    useCase = new ApplyPromoUseCase(
      mockCartRepository,
      mockPromoRepository,
      promoEvaluationService,
    );
  });

  it('berhasil menerapkan satu promo platform', async () => {
    mockPromoRepository.findByIds.mockResolvedValue([
      platformPromo,
    ]);

    const result = await useCase.execute({
      cartId: 1,
      promoIds: [2],
      evaluationDate,
    });

    // 10% dari Rp750.000
    expect(result.originalTotal).toBe(750000);
    expect(result.totalDiscount).toBe(75000);
    expect(result.finalTotal).toBe(675000);

    expect(result.promos).toHaveLength(1);

    expect(result.promos[0].promoId).toBe(2);
  });

  it('berhasil menerapkan promo seller dan platform', async () => {
    mockPromoRepository.findByIds.mockResolvedValue([
      sellerPromo,
      platformPromo,
    ]);

    const result = await useCase.execute({
      cartId: 1,
      promoIds: [1, 2],
      evaluationDate,
    });

    // Seller:
    // 10% x Rp500.000 = Rp50.000

    // Platform:
    // 10% x Rp700.000 = Rp70.000

    expect(result.originalTotal).toBe(750000);

    expect(result.totalDiscount).toBe(120000);

    expect(result.finalTotal).toBe(630000);

    expect(result.promos).toHaveLength(2);

    expect(result.promos[0].source)
      .toBe('SELLER');

    expect(result.promos[1].source)
      .toBe('PLATFORM');
  });

  it('menolak jika tidak memilih promo', async () => {
    await expect(
      useCase.execute({
        cartId: 1,
        promoIds: [],
        evaluationDate,
      }),
    ).rejects.toBeInstanceOf(
      InvalidPromoSelectionError,
    );

    expect(
      mockCartRepository.findById,
    ).not.toHaveBeenCalled();

    expect(
      mockPromoRepository.findByIds,
    ).not.toHaveBeenCalled();
  });

  it('menolak jika memilih lebih dari dua promo', async () => {
    await expect(
      useCase.execute({
        cartId: 1,
        promoIds: [1, 2, 3],
        evaluationDate,
      }),
    ).rejects.toBeInstanceOf(
      InvalidPromoSelectionError,
    );

    expect(
      mockCartRepository.findById,
    ).not.toHaveBeenCalled();
  });

  it('menolak ID promo yang tidak valid', async () => {
    await expect(
      useCase.execute({
        cartId: 1,
        promoIds: [0],
        evaluationDate,
      }),
    ).rejects.toBeInstanceOf(
      InvalidPromoSelectionError,
    );

    expect(
      mockPromoRepository.findByIds,
    ).not.toHaveBeenCalled();
  });

  it('menolak promo yang sama dipilih dua kali', async () => {
    await expect(
      useCase.execute({
        cartId: 1,
        promoIds: [1, 1],
        evaluationDate,
      }),
    ).rejects.toBeInstanceOf(
      InvalidPromoSelectionError,
    );

    expect(
      mockPromoRepository.findByIds,
    ).not.toHaveBeenCalled();
  });

  it('menolak jika keranjang tidak ditemukan', async () => {
    mockCartRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      useCase.execute({
        cartId: 999,
        promoIds: [1],
        evaluationDate,
      }),
    ).rejects.toBeInstanceOf(
      CartNotFoundError,
    );

    expect(
      mockPromoRepository.findByIds,
    ).not.toHaveBeenCalled();
  });

  it('menolak jika salah satu promo tidak ditemukan', async () => {
    // User meminta promo 1 dan 999,
    // tetapi repository hanya menemukan promo 1.
    mockPromoRepository.findByIds.mockResolvedValue([
      sellerPromo,
    ]);

    await expect(
      useCase.execute({
        cartId: 1,
        promoIds: [1, 999],
        evaluationDate,
      }),
    ).rejects.toBeInstanceOf(
      PromoNotFoundError,
    );
  });
});