
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import type { ShippingServiceType } from
  '../../domain/types/shipping-quote';

export class ValidatePromosDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cartId!: number;

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  selectedPromoIds!: number[];

  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  promoIdsToValidate!: number[];

  @IsIn([
    'REGULAR',
    'TRUCKING',
    'INSTANT',
    'SAME_DAY',
  ])
  shippingServiceType!: ShippingServiceType;
}
