
import { CartRepository } from
  '../../domain/repositories/cart.repository';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { OrderRepository } from
  '../../domain/repositories/order.repository';

import { CartNotFoundError } from
  '../../domain/errors/cart.errors';

import { Cart } from
  '../../domain/entities/cart.entity';

import { Promo } from
  '../../domain/entities/promo.entity';

import {
  PromoNotFoundError,
  InvalidPromoSelectionError,
} from '../../domain/errors/promo.errors';

import { ShippingService } from
  '../../domain/services/shipping.service';

import { PromoEvaluationService } from
  '../../domain/services/promo-evaluation.service';

import { CheckoutCalculator } from
  '../../domain/services/checkout-calculator';

import { ShippingServiceType } from
  '../../domain/types/shipping-quote';

import { CheckoutSummary } from
  '../../domain/types/checkout-summary';

import type { CreateOrderPromoInput } from
  '../../domain/repositories/order.repository';

export interface CheckoutInput {
  cartId: number;
  userId: number;
  promoIds: number[];
  shippingServiceType: ShippingServiceType;
  evaluationDate: Date;
}

export interface CheckoutPreparation {
  cart: Cart;
  summary: CheckoutSummary;
  promos: CreateOrderPromoInput[];
}

export class CheckoutUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly promoRepository: PromoRepository,
    private readonly orderRepository: OrderRepository,
    private readonly shippingService: ShippingService,
    private readonly promoEvaluationService:
      PromoEvaluationService,
    private readonly checkoutCalculator:
      CheckoutCalculator,
  ) {}

  // Digunakan untuk preview maupun pembuatan Order.
  async prepare(
    data: CheckoutInput,
  ): Promise<CheckoutPreparation> {

    // 1. Validasi pilihan promo.
    // Tidak ada lagi batas maksimal dua promo.
    const hasInvalidId = data.promoIds.some(
      (id) =>
        !Number.isSafeInteger(id) ||
        id <= 0,
    );

    if (hasInvalidId) {
      throw new InvalidPromoSelectionError(
        'ID promo tidak valid',
      );
    }

    if (
      new Set(data.promoIds).size !==
      data.promoIds.length
    ) {
      throw new InvalidPromoSelectionError(
        'Promo yang sama tidak boleh dipilih lebih dari satu kali',
      );
    }

    // 2. Ambil Cart.
    const cart =
      await this.cartRepository.findById(
        data.cartId,
      );

    if (!cart || cart.userId !== data.userId) {
      throw new CartNotFoundError();
    }

    // 3. Tentukan ongkir dari server.
    const shipping = this.shippingService.quote(
      data.shippingServiceType,
    );

    // 4. Ambil promo.
    let promos: Promo[] = [];

    if (data.promoIds.length > 0) {
      promos =
        await this.promoRepository.findByIds(
          data.promoIds,
        );

      if (
        promos.length !== data.promoIds.length
      ) {
        throw new PromoNotFoundError();
      }
    }

    // 5. Evaluasi kombinasi dan kelayakan promo.
    const promoResult =
      this.promoEvaluationService.evaluate(
        cart,
        promos,
        data.evaluationDate,
        shipping.shippingCost,
      );

    // 6. Periksa riwayat penggunaan promo.
    // FREE_SHIPPING dikecualikan.
    for (const result of promoResult.promos) {
      if (!result.isEligible) {
        continue;
      }

      const selectedPromo = promos.find(
        (promo) =>
          promo.config.id === result.promoId,
      );

      if (!selectedPromo) {
        throw new PromoNotFoundError();
      }

      if (
        selectedPromo.config.voucherType ===
        'FREE_SHIPPING'
      ) {
        continue;
      }

      const hasUsedPromo =
        await this.orderRepository.hasUserUsedPromo(
          data.userId,
          selectedPromo.config.id,
        );

      if (hasUsedPromo) {
        throw new InvalidPromoSelectionError(
          'Kamu sudah pernah menggunakan promo ini',
        );
      }
    }

    // 7. Hitung total.
    const summary =
      this.checkoutCalculator.calculate(
        promoResult.originalTotal,
        promoResult.totalDiscount,
        shipping,
        promoResult.shippingDiscount,
      );

    // 8. Siapkan promo yang eligible untuk Order.
    const appliedPromos: CreateOrderPromoInput[] =
      promoResult.promos
        .filter((result) => result.isEligible)
        .map((result) => {
          const selectedPromo = promos.find(
            (promo) =>
              promo.config.id === result.promoId,
          );

          if (!selectedPromo) {
            throw new PromoNotFoundError();
          }

          return {
            promoId: result.promoId,
            source: selectedPromo.config.source,
            voucherType:
              selectedPromo.config.voucherType,
            discountAmount: result.discount,
          };
        });

    return {
      cart,
      summary,
      promos: appliedPromos,
    };
  }

  // Endpoint preview tetap menggunakan method ini.
  async execute(
    data: CheckoutInput,
  ): Promise<CheckoutSummary> {
    const result = await this.prepare(data);

    return result.summary;
  }
}
