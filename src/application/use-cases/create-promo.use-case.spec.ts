import {
  CreatePromoUseCase,
  CreatePromoInput,
} from './create-promo.use-case';

import {
  Promo,
  PromoConfig,
} from '../../domain/entities/promo.entity';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { InvalidPromoInputError } from
  '../../domain/errors/promo.errors';

describe('CreatePromoUseCase', () => {
  let useCase: CreatePromoUseCase;

  let mockPromoRepository: jest.Mocked<PromoRepository>;

  const baseInput: CreatePromoInput = {
    name: 'Diskon Platform 10%',
    source: 'PLATFORM',
    sellerId: null,

    discountType: 'PERCENTAGE',
    discountValue: 10,

    minimumPurchase: 100000,
    maximumDiscount: 25000,
    stock: 2,
  voucherType: 'DISCOUNT',
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
    };

    useCase = new CreatePromoUseCase(
      mockPromoRepository,
    );
  });

  it('berhasil membuat promo platform', async () => {
    const savedPromo = new Promo({
      id: 1,
      ...baseInput,
    });

    mockPromoRepository.create.mockResolvedValue(
      savedPromo,
    );

    const result = await useCase.execute({
      ...baseInput,
    });

    expect(
      mockPromoRepository.create,
    ).toHaveBeenCalledTimes(1);

    expect(result.config.id).toBe(1);
    expect(result.config.source).toBe('PLATFORM');
    expect(result.config.sellerId).toBeNull();
    expect(result.config.discountValue).toBe(10);
  });

  it('berhasil membuat promo seller', async () => {
    const input: CreatePromoInput = {
      ...baseInput,
      name: 'Diskon Seller 15%',
      source: 'SELLER',
      sellerId: 1,
      discountValue: 15,
    };

    const savedPromo = new Promo({
      id: 2,
      ...input,
    });

    mockPromoRepository.create.mockResolvedValue(
      savedPromo,
    );

    const result = await useCase.execute(input);

    expect(
      mockPromoRepository.create,
    ).toHaveBeenCalledTimes(1);

    expect(result.config.source).toBe('SELLER');
    expect(result.config.sellerId).toBe(1);
  });

  it('menolak promo seller tanpa sellerId', async () => {
    const input: CreatePromoInput = {
      ...baseInput,
      source: 'SELLER',
      sellerId: null,
    };

    await expect(
      useCase.execute(input),
    ).rejects.toBeInstanceOf(
      InvalidPromoInputError,
    );

    expect(
      mockPromoRepository.create,
    ).not.toHaveBeenCalled();
  });

  it('menolak persentase diskon di atas 100%', async () => {
    const input: CreatePromoInput = {
      ...baseInput,
      discountValue: 110,
    };

    await expect(
      useCase.execute(input),
    ).rejects.toBeInstanceOf(
      InvalidPromoInputError,
    );

    expect(
      mockPromoRepository.create,
    ).not.toHaveBeenCalled();
  });

  it('meneruskan Promo valid ke repository', async () => {
    const savedPromo = new Promo({
      id: 10,
      ...baseInput,
    });

    mockPromoRepository.create.mockResolvedValue(
      savedPromo,
    );

    await useCase.execute(baseInput);

    expect(
      mockPromoRepository.create,
    ).toHaveBeenCalledTimes(1);

    const promoArgument =
      mockPromoRepository.create.mock.calls[0][0];

    expect(promoArgument).toBeInstanceOf(Promo);

    expect(promoArgument.config.name)
      .toBe('Diskon Platform 10%');

    expect(promoArgument.config.id).toBe(0);
  });
});