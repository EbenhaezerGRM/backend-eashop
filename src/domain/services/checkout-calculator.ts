import { CheckoutSummary } from '../types/checkout-summary';
import { ShippingQuote } from '../types/shipping-quote';

export class CheckoutCalculator {
  calculate(
    subtotal: number,
    productDiscount: number,
    shipping: ShippingQuote,
    shippingDiscount: number,
  ): CheckoutSummary {
    const validProductDiscount = Math.min(
      Math.max(0, productDiscount),
      subtotal,
    );

    const validShippingDiscount = Math.min(
      Math.max(0, shippingDiscount),
      shipping.shippingCost,
    );

    const totalPayable =
      subtotal -
      validProductDiscount +
      shipping.shippingCost -
      validShippingDiscount;

    return {
      subtotal,
      productDiscount: validProductDiscount,
      shipping,
      shippingDiscount: validShippingDiscount,
      totalPayable: Math.max(0, totalPayable),
    };
  }
}