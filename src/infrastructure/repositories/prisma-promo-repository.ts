import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import {
  Promo,
  type ShippingDiscountTier,
} from '../../domain/entities/promo.entity';

import { PromoRepository } from
  '../../domain/repositories/promo.repository';

import { PrismaService } from
  '../database/prisma.service';

// Struktur data promo yang diambil dari Prisma.
type PromoRecord = {
  id: number;
  name: string;
  source: 'SELLER' | 'PLATFORM';
  stock: number;
  sellerId: number | null;
  voucherType: 'DISCOUNT' | 'FREE_SHIPPING';
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: { toNumber(): number };
  minimumPurchase: number;
  maximumDiscount: number | null;
  shippingDiscountTiers: Prisma.JsonValue | null;
  isStackable: boolean;
  startsAt: Date;
  endsAt: Date;
};

@Injectable()
export class PrismaPromoRepository extends PromoRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async findAll(): Promise<Promo[]> {
    const records = await this.prisma.promo.findMany({
      orderBy: { id: 'asc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: number): Promise<Promo | null> {
    const record = await this.prisma.promo.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async findByIds(ids: number[]): Promise<Promo[]> {
    if (ids.length === 0) {
      return [];
    }

    const records = await this.prisma.promo.findMany({
      where: {
        id: { in: ids },
      },
      orderBy: { id: 'asc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async create(promo: Promo): Promise<Promo> {
    const config = promo.config;

    const record = await this.prisma.promo.create({
      data: {
        name: config.name,
        source: config.source,
        sellerId: config.sellerId,
        voucherType: config.voucherType,
        stock: config.stock,
        discountType: config.discountType,
        discountValue: config.discountValue,
        minimumPurchase: config.minimumPurchase,
        maximumDiscount: config.maximumDiscount,
        shippingDiscountTiers:
        config.shippingDiscountTiers === null
          ? Prisma.JsonNull
          : (config.shippingDiscountTiers as unknown as Prisma.InputJsonValue),
        isStackable: config.isStackable,
        startsAt: config.startsAt,
        endsAt: config.endsAt,
      },
    });

    return this.toDomain(record);
  }

  private mapShippingDiscountTiers(
    value: Prisma.JsonValue | null,
  ): ShippingDiscountTier[] | null {
    if (value === null) {
      return null;
    }

    if (!Array.isArray(value)) {
      throw new Error(
        'Format shippingDiscountTiers dari database tidak valid',
      );
    }

    return value.map((item) => {
      if (
        typeof item !== 'object' ||
        item === null ||
        Array.isArray(item) ||
        typeof item.minimumSubtotal !== 'number' ||
        typeof item.maximumShippingDiscount !== 'number'
      ) {
        throw new Error(
          'Format tier subsidi ongkir dari database tidak valid',
        );
      }

      return {
        minimumSubtotal: item.minimumSubtotal,
        maximumShippingDiscount: item.maximumShippingDiscount,
      };
    });
  }

  // Mengubah hasil Prisma menjadi Promo Entity.
  private toDomain(record: PromoRecord): Promo {
    return new Promo({
      id: record.id,
      name: record.name,
      source: record.source,
      sellerId: record.sellerId,
      voucherType: record.voucherType,
      stock: record.stock,
      discountType: record.discountType,
      discountValue: record.discountValue.toNumber(),
      minimumPurchase: record.minimumPurchase,
      maximumDiscount: record.maximumDiscount,
      shippingDiscountTiers: this.mapShippingDiscountTiers(
        record.shippingDiscountTiers,
      ),
      isStackable: record.isStackable,
      startsAt: record.startsAt,
      endsAt: record.endsAt,
    });
  }
}