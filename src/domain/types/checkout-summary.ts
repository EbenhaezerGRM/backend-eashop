import { ShippingQuote } from './shipping-quote';

export interface CheckoutSummary {
  subtotal: number;

  productDiscount: number;

  shipping: ShippingQuote;
  shippingDiscount: number;

  totalPayable: number;
}