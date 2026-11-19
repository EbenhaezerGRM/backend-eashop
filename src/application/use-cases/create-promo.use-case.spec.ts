
import {
  CreatePromoUseCase,
  CreatePromoInput,
} from './create-promo.use-case';

import {
  Promo,
} from '../../domain/entities/promo.entity';

import { Seller } from
  '../../domain/entities/seller.entity';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { SellerRepository } from
  '../../domain/repositories/seller.repository';

import { InvalidPromoInputError } from
  '../../domain/errors/promo.errors';

import { SellerAccountRequiredError } from
  '../../domain/errors/seller.errors';

describe('CreatePromoUseCase', () => {
  let useCase: CreatePromoUseCase;

  let mockPromoRepository: jest.Mocked<PromoRepository>;
  let mockSellerRepository: jest.Mocked<SellerRepository>;

  const userId = 42;

  const seller = new Seller(
    1,
    userId,
    'Toko Test',
    'Toko untuk pengujian',
    new Date(),
    new Date(),
  );

  const baseInput: CreatePromoInput = {
    name: 'Diskon Seller 10%',
    voucherType: 'DISCOUNT',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumPurchase: 100000,
    maximumDiscount: 25000,
    stock: 2,
    shippingDiscountTiers: null,
    isStackable: true,
    startsAt: new Date('2026-09-01T00:00:00Z'),
    endsAt: new Date('2026-12-31T23:59:59Z'),
  };

  beforeEach(() => {
    mockPromoRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIds: jest.fn(),
      create: jest.fn(),
      findBySellerId:jest.fn(),
    };

    mockSellerRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
    };

    mockSellerRepository.findByUserId.mockResolvedValue(seller);

    useCase = new CreatePromoUseCase(
      mockPromoRepository,
      mockSellerRepository,
    );
  });

  it('berhasil membuat promo Seller', async () => {
    const input: CreatePromoInput = {
      ...baseInput,
      name: 'Diskon Seller 15%',
      discountValue: 15,
    };

    const savedPromo = new Promo({
      id: 2,
      ...input,
      source: 'SELLER',
      sellerId: 1,
    });

    mockPromoRepository.create.mockResolvedValue(
      savedPromo,
    );

    const result = await useCase.execute(input, userId);

    expect(mockSellerRepository.findByUserId)
      .toHaveBeenCalledWith(userId);

    expect(mockPromoRepository.create)
      .toHaveBeenCalledTimes(1);

    expect(result.config.source).toBe('SELLER');
    expect(result.config.sellerId).toBe(1);
    expect(result.config.discountValue).toBe(15);
  });

  it('menolak membuat promo jika user belum memiliki akun Seller', async () => {
    mockSellerRepository.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute(baseInput, userId),
    ).rejects.toBeInstanceOf(
      SellerAccountRequiredError,
    );

    expect(mockPromoRepository.create)
      .not.toHaveBeenCalled();
  });

  it('menolak persentase diskon di atas 100%', async () => {
    const input: CreatePromoInput = {
      ...baseInput,
      discountValue: 110,
    };

    await expect(
      useCase.execute(input, userId),
    ).rejects.toBeInstanceOf(
      InvalidPromoInputError,
    );

    expect(mockPromoRepository.create)
      .not.toHaveBeenCalled();
  });

  it('mengabaikan source dan sellerId palsu dari input', async () => {
    // Simulasi client mencoba memalsukan identitas Seller.
    const maliciousInput = {
      ...baseInput,
      source: 'PLATFORM',
      sellerId: 999,
    } as CreatePromoInput;

    const savedPromo = new Promo({
      id: 3,
      ...baseInput,
      source: 'SELLER',
      sellerId: 1,
    });

    mockPromoRepository.create.mockResolvedValue(
      savedPromo,
    );

    const result = await useCase.execute(
      maliciousInput,
      userId,
    );

    const createdPromo =
      mockPromoRepository.create.mock.calls[0][0];

    expect(createdPromo.config.source).toBe('SELLER');
    expect(createdPromo.config.sellerId).toBe(1);

    expect(result.config.source).toBe('SELLER');
    expect(result.config.sellerId).toBe(1);
  });
});
