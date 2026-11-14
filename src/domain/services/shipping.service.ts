import {
  ShippingQuote,
  ShippingServiceType,
} from '../types/shipping-quote';

const SHIPPING_RATES: Record<
  ShippingServiceType,
  number
> = {
  REGULAR: 19_000,
  TRUCKING: 25_000,
  INSTANT: 90_000,
  SAME_DAY: 60_000,
};

export class ShippingService {
  quote(
    serviceType: ShippingServiceType,
  ): ShippingQuote {
    return {
      serviceType,
      shippingCost: SHIPPING_RATES[serviceType],
    };
  }
}