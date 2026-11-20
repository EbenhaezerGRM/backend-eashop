
import { CartRepository } from
  '../../domain/repositories/cart.repository';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { OrderRepository } from
  '../../domain/repositories/order.repository';

import { CartNotFoundError } from
  '../../domain/errors/cart.errors';

import {
  PromoNotFoundError,
  InvalidPromoSelectionError,
  InvalidPromoCombinationError,
} from '../../domain/errors/promo.errors';

import { Promo } from
  '../../domain/entities/promo.entity';

import { ShippingService } from
  '../../domain/services/shipping.service';

import { PromoEvaluationService } from
  '../../domain/services/promo-evaluation.service';

import { PromoValidationReason } from
  '../../domain/services/promo-validator';

import { ShippingServiceType } from
  '../../domain/types/shipping-quote';

export interface ValidatePromosInput {
  cartId: number;
  userId: number;
  selectedPromoIds: number[];
  promoIdsToValidate: number[];
  shippingServiceType: ShippingServiceType;
  evaluationDate: Date;
}

export interface PromoIssue {
  promoId: number | null;
  reasonCode: string;
  reason: string;
}

export interface PromoAvailability {
  promoId: number;
  source: string;
  voucherType: string;
  canSelect: boolean;
  reasonCode: string | null;
  reason: string | null;
  discountAmount: number;
}

export class ValidatePromosUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly promoRepository: PromoRepository,
    private readonly orderRepository: OrderRepository,
    private readonly shippingService: ShippingService,
    private readonly promoEvaluationService:
      PromoEvaluationService,
  ) {}

  async execute(data: ValidatePromosInput) {
    // 1. Validasi ID.
    const allIds = [
      ...data.selectedPromoIds,
      ...data.promoIdsToValidate,
    ];

    if (
      allIds.some(
        (id) =>
          !Number.isSafeInteger(id) || id <= 0,
      )
    ) {
      throw new InvalidPromoSelectionError(
        'ID promo tidak valid',
      );
    }

    if (
      new Set(data.selectedPromoIds).size !==
      data.selectedPromoIds.length
    ) {
      throw new InvalidPromoSelectionError(
        'Promo yang dipilih tidak boleh duplikat',
      );
    }

    if (
      new Set(data.promoIdsToValidate).size !==
      data.promoIdsToValidate.length
    ) {
      throw new InvalidPromoSelectionError(
        'Daftar promo validasi tidak boleh duplikat',
      );
    }

    // 2. Ambil Cart milik user.
    const cart = await this.cartRepository.findById(
      data.cartId,
    );

    if (!cart || cart.userId !== data.userId) {
      throw new CartNotFoundError();
    }

    // 3. Ambil ongkir dari server.
    const shipping = this.shippingService.quote(
      data.shippingServiceType,
    );

    // 4. Ambil semua promo sekaligus.
    const uniqueIds = [...new Set(allIds)];

    const allPromos =
      uniqueIds.length > 0
        ? await this.promoRepository.findByIds(
            uniqueIds,
          )
        : [];

    if (allPromos.length !== uniqueIds.length) {
      throw new PromoNotFoundError();
    }

    const promoMap = new Map<number, Promo>(
      allPromos.map((promo) => [
        promo.config.id,
        promo,
      ]),
    );

    const selectedPromos = data.selectedPromoIds.map(
      (id) => promoMap.get(id)!,
    );

    const selectedIdSet = new Set(
      data.selectedPromoIds,
    );

    // Promo yang sudah dipilih tidak perlu diuji
    // lagi sebagai calon promo.
    const candidateIds = data.promoIdsToValidate.filter(
      (id) => !selectedIdSet.has(id),
    );

    // 5. Validasi pilihan promo yang sudah dipilih.
    let selectionIssue: PromoIssue | null = null;

    if (selectedPromos.length > 0) {
      try {
        const selectedEvaluation =
          this.promoEvaluationService.evaluate(
            cart,
            selectedPromos,
            data.evaluationDate,
            shipping.shippingCost,
          );

        const invalidSelected =
          selectedEvaluation.promos.find(
            (result) => !result.isEligible,
          );

        if (invalidSelected) {
          selectionIssue = {
            promoId: invalidSelected.promoId,
            ...this.mapValidationReason(
              invalidSelected.reason,
            ),
          };
        } else {
          // Periksa riwayat penggunaan promo.
          for (const promo of selectedPromos) {
            if (
              promo.config.voucherType ===
              'FREE_SHIPPING'
            ) {
              continue;
            }

            const hasUsed =
              await this.orderRepository.hasUserUsedPromo(
                data.userId,
                promo.config.id,
              );

            if (hasUsed) {
              selectionIssue = {
                promoId: promo.config.id,
                reasonCode: 'PROMO_ALREADY_USED',
                reason:
                  'Kamu sudah pernah menggunakan promo ini.',
              };

              break;
            }
          }
        }
      } catch (error) {
        if (
          error instanceof InvalidPromoCombinationError
        ) {
          selectionIssue =
            this.mapCombinationError(error);
        } else {
          throw error;
        }
      }
    }

    // 6. Uji setiap calon promo terhadap
    // seluruh promo yang sedang dipilih.
    const results: PromoAvailability[] = [];

    for (const promoId of candidateIds) {
      const candidate = promoMap.get(promoId);

      if (!candidate) {
        throw new PromoNotFoundError();
      }

      // Jika pilihan yang sudah ada tidak valid,
      // calon promo belum bisa ditambahkan.
      if (selectionIssue) {
        results.push({
          promoId,
          source: candidate.config.source,
          voucherType: candidate.config.voucherType,
          canSelect: false,
          reasonCode: 'SELECTED_PROMO_INVALID',
          reason:
            `Pilihan promo saat ini bermasalah: ${selectionIssue.reason}`,
          discountAmount: 0,
        });

        continue;
      }

      const combinedPromos = [
        ...selectedPromos,
        candidate,
      ];

      try {
        // Evaluasi kombinasi menggunakan service lama.
        const evaluation =
          this.promoEvaluationService.evaluate(
            cart,
            combinedPromos,
            data.evaluationDate,
            shipping.shippingCost,
          );

        const candidateResult =
          evaluation.promos.find(
            (result) =>
              result.promoId === promoId,
          );

        if (!candidateResult) {
          throw new PromoNotFoundError();
        }

        // Cek stok, periode, minimum pembelian,
        // dan produk yang memenuhi syarat.
        if (!candidateResult.isEligible) {
          const issue = this.mapValidationReason(
            candidateResult.reason,
          );

          results.push({
            promoId,
            source: candidate.config.source,
            voucherType: candidate.config.voucherType,
            canSelect: false,
            reasonCode: issue.reasonCode,
            reason: issue.reason,
            discountAmount: 0,
          });

          continue;
        }

        // Promo DISCOUNT hanya boleh digunakan sekali.
        // FREE_SHIPPING dikecualikan.
        if (
          candidate.config.voucherType !==
          'FREE_SHIPPING'
        ) {
          const hasUsed =
            await this.orderRepository.hasUserUsedPromo(
              data.userId,
              promoId,
            );

          if (hasUsed) {
            results.push({
              promoId,
              source: candidate.config.source,
              voucherType: candidate.config.voucherType,
              canSelect: false,
              reasonCode: 'PROMO_ALREADY_USED',
              reason:
                'Kamu sudah pernah menggunakan promo ini.',
              discountAmount: 0,
            });

            continue;
          }
        }

        // Promo bisa digunakan bersama pilihan saat ini.
        results.push({
          promoId,
          source: candidate.config.source,
          voucherType: candidate.config.voucherType,
          canSelect: true,
          reasonCode: null,
          reason: null,
          discountAmount: candidateResult.discount,
        });
      } catch (error) {
        if (
          error instanceof InvalidPromoCombinationError
        ) {
          const issue = this.mapCombinationError(error);

          results.push({
            promoId,
            source: candidate.config.source,
            voucherType: candidate.config.voucherType,
            canSelect: false,
            reasonCode: issue.reasonCode,
            reason: issue.reason,
            discountAmount: 0,
          });

          continue;
        }

        throw error;
      }
    }

    return {
      selectedPromoIds: data.selectedPromoIds,
      selectionValid: selectionIssue === null,
      selectionError: selectionIssue,
      promos: results,
    };
  }

  private mapValidationReason(
    reason: PromoValidationReason | null,
  ): Omit<PromoIssue, 'promoId'> {
    switch (reason) {
      case 'OUT_OF_STOCK':
        return {
          reasonCode: 'OUT_OF_STOCK',
          reason: 'Stok promo sudah habis.',
        };

      case 'NOT_ACTIVE':
        return {
          reasonCode: 'NOT_ACTIVE',
          reason: 'Promo belum aktif atau sudah kedaluwarsa.',
        };

      case 'NO_ELIGIBLE_PRODUCTS':
        return {
          reasonCode: 'NO_ELIGIBLE_PRODUCTS',
          reason:
            'Tidak ada produk di keranjang yang memenuhi promo ini.',
        };

      case 'MINIMUM_PURCHASE_NOT_MET':
        return {
          reasonCode: 'MINIMUM_PURCHASE_NOT_MET',
          reason:
            'Minimum pembelian untuk promo ini belum terpenuhi.',
        };

      default:
        return {
          reasonCode: 'PROMO_NOT_ELIGIBLE',
          reason: 'Promo tidak memenuhi persyaratan.',
        };
    }
  }

  private mapCombinationError(
    error: InvalidPromoCombinationError,
  ): PromoIssue {
    const message = error.message.toLowerCase();

    if (message.includes('gratis ongkir')) {
      return {
        promoId: null,
        reasonCode: 'FREE_SHIPPING_CONFLICT',
        reason:
          'Kamu sudah memilih promo gratis ongkir lainnya.',
      };
    }

    if (message.includes('platform')) {
      return {
        promoId: null,
        reasonCode: 'PLATFORM_PROMO_CONFLICT',
        reason:
          'Promo PLATFORM tidak dapat digabung dengan promo PLATFORM lainnya.',
      };
    }

    if (message.includes('seller yang sama')) {
      return {
        promoId: null,
        reasonCode: 'SAME_SELLER_PROMO_CONFLICT',
        reason:
          'Kamu sudah memilih promo dari seller yang sama.',
      };
    }

    if (message.includes('kombinasi')) {
      return {
        promoId: null,
        reasonCode: 'NON_STACKABLE_PROMO',
        reason:
          'Promo yang dipilih tidak mengizinkan kombinasi dengan promo ini.',
      };
    }

    return {
      promoId: null,
      reasonCode: 'INVALID_PROMO_COMBINATION',
      reason:
        'Kombinasi promo yang dipilih tidak diperbolehkan.',
    };
  }
}
