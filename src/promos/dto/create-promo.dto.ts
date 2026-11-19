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
} from 'class-validator';

import { Type } from 'class-transformer';

import type {
  DiscountType,
  VoucherType,
  ShippingDiscountTier,
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

  @ValidateIf((_, value) => value !== null)
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

  @ValidateIf((_, value) => value !== null)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingDiscountTierDto)
  shippingDiscountTiers: ShippingDiscountTier[] | null;
}
