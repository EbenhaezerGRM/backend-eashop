import { CheckoutUseCase } from './checkout-use-case';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { ShippingService } from
  '../../domain/services/shipping.service';

import { PromoEvaluationService } from
  '../../domain/services/promo-evaluation.service';

import { CheckoutCalculator } from
  '../../domain/services/checkout-calculator';

import { Promo } from
  '../../domain/entities/promo.entity';

import { Cart } from
  '../../domain/entities/cart.entity';

import { ShippingQuote } from
  '../../domain/types/shipping-quote';

import { CheckoutSummary } from
  '../../domain/types/checkout-summary';

describe('CheckoutUseCase', () => {
  let useCase: CheckoutUseCase;

  const cart = {} as Cart;

  const shipping: ShippingQuote = {
    serviceType: 'REGULAR',
    shippingCost: 19_000,
  };

  const summary: CheckoutSummary = {
    subtotal: 750_000,
    productDiscount: 50_000,
    shipping,
    shippingDiscount: 19_000,
    totalPayable: 700_000,
  };

  const promoEvaluationResult = {
    originalTotal: 750_000,
    totalDiscount: 50_000,
    shippingDiscount: 19_000,
    finalTotal: 700_000,
    promos: [],
  };

  const cartRepository = {
    findById: jest.fn(),
  } as unknown as CartRepository;

  const promoRepository = {
    findByIds: jest.fn(),
  } as unknown as PromoRepository;

  const shippingService = {
    quote: jest.fn(),
  } as unknown as ShippingService;

  const promoEvaluationService = {
    evaluate: jest.fn(),
  } as unknown as PromoEvaluationService;

  const checkoutCalculator = {
    calculate: jest.fn(),
  } as unknown as CheckoutCalculator;

  const evaluationDate =
    new Date('2026-01-15T12:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new CheckoutUseCase(
      cartRepository,
      promoRepository,
      shippingService,
      promoEvaluationService,
      checkoutCalculator,
    );

    (cartRepository.findById as jest.Mock)
      .mockResolvedValue(cart);

    (shippingService.quote as jest.Mock)
      .mockReturnValue(shipping);

    (promoRepository.findByIds as jest.Mock)
      .mockResolvedValue([]);

    (promoEvaluationService.evaluate as jest.Mock)
      .mockReturnValue(promoEvaluationResult);

    (checkoutCalculator.calculate as jest.Mock)
      .mockReturnValue(summary);
  });

  it('membuat checkout tanpa promo', async () => {
    const result = await useCase.execute({
      cartId: 1,
      userId: 1,
      promoIds: [],
      shippingServiceType: 'REGULAR',
      evaluationDate,
    });

    expect(promoRepository.findByIds)
      .not.toHaveBeenCalled();

    expect(promoEvaluationService.evaluate)
      .toHaveBeenCalledWith(
        cart,
        [],
        evaluationDate,
        19_000,
      );

    expect(checkoutCalculator.calculate)
      .toHaveBeenCalledWith(
        750_000,
        50_000,
        shipping,
        19_000,
      );

    expect(result).toEqual(summary);
  });

  it('mengambil promo yang dipilih dan mengevaluasinya', async () => {
    const selectedPromos = [{} as Promo];

    (promoRepository.findByIds as jest.Mock)
      .mockResolvedValue(selectedPromos);

    const result = await useCase.execute({
      cartId: 1,
      userId: 1,
      promoIds: [10],
      shippingServiceType: 'REGULAR',
      evaluationDate,
    });

    expect(promoRepository.findByIds)
      .toHaveBeenCalledWith([10]);

    expect(promoEvaluationService.evaluate)
      .toHaveBeenCalledWith(
        cart,
        selectedPromos,
        evaluationDate,
        19_000,
      );

    expect(result).toEqual(summary);
  });

  it('menggunakan tipe layanan pengiriman yang dipilih', async () => {
    const instantShipping: ShippingQuote = {
      serviceType: 'INSTANT',
      shippingCost: 90_000,
    };

    (shippingService.quote as jest.Mock)
      .mockReturnValue(instantShipping);

    (promoEvaluationService.evaluate as jest.Mock)
      .mockReturnValue({
        ...promoEvaluationResult,
        shippingDiscount: 40_000,
      });

    const result = await useCase.execute({
      cartId: 1,
      userId: 1,
      promoIds: [],
      shippingServiceType: 'INSTANT',
      evaluationDate,
    });

    expect(shippingService.quote)
      .toHaveBeenCalledWith('INSTANT');

    expect(promoEvaluationService.evaluate)
      .toHaveBeenCalledWith(
        cart,
        [],
        evaluationDate,
        90_000,
      );

    expect(checkoutCalculator.calculate)
      .toHaveBeenCalledWith(
        750_000,
        50_000,
        instantShipping,
        40_000,
      );

    expect(result).toEqual(summary);
  });
});