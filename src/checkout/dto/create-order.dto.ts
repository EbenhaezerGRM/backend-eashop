
import {
  IsInt,
  Min,
} from 'class-validator';

import { CheckoutPreviewDto } from './checkout-preview.dto';

export class CreateOrderDto extends CheckoutPreviewDto {
  @IsInt()
  @Min(1)
  addressId: number;
}
