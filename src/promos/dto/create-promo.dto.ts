import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  ValidateIf,
  Matches,
  Min,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';

import { Type } from 'class-transformer';

import type {
  DiscountType,
  PromoSource,
  VoucherType,
} from '../../domain/entities/promo.entity';

export class ShippingDiscountTierDto {
  @IsInt()
  @Min(0)
  minimumSubtotal: number;

  @IsInt()
  @Min(1)
  maximumShippingDiscount: number;
}

export class CreatePromoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(['SELLER', 'PLATFORM'])
  source: PromoSource;

  // Wajib jika source SELLER.
  // Untuk PLATFORM boleh null atau tidak dikirim.
  @ValidateIf((o) => o.source === 'SELLER')
  @IsInt()
  @Min(1)
  sellerId?: number | null;

  @IsIn(['DISCOUNT', 'FREE_SHIPPING'])
  voucherType: VoucherType;

  @IsInt()
  @Min(0)
  stock: number;

  @IsIn(['PERCENTAGE', 'FIXED'])
  discountType: DiscountType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  discountValue: number;

  @IsInt()
  @Min(0)
  minimumPurchase: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maximumDiscount: number | null;

  @IsBoolean()
  isStackable: boolean;

  @IsDateString()
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  startsAt: string;

  @IsDateString()
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  endsAt: string;

  // Wajib berupa array jika FREE_SHIPPING.
  // Tidak wajib jika DISCOUNT.
  @ValidateIf(
    (o) => o.voucherType === 'FREE_SHIPPING',
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingDiscountTierDto)
  shippingDiscountTiers?: ShippingDiscountTierDto[] | null;
}
