import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

import type { ShippingServiceType } from
  '../../domain/types/shipping-quote';

const SHIPPING_SERVICE_TYPES: ShippingServiceType[] = [
  'REGULAR',
  'TRUCKING',
  'INSTANT',
  'SAME_DAY',
];

export class CheckoutPreviewDto {
  @IsInt()
  @Min(1)
  cartId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  promoIds?: number[];

  @IsIn(SHIPPING_SERVICE_TYPES)
  shippingServiceType: ShippingServiceType;
}