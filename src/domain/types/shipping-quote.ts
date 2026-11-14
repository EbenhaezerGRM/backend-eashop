export type ShippingServiceType =
  | 'REGULAR'
  | 'TRUCKING'
  | 'INSTANT'
  | 'SAME_DAY';

export interface ShippingQuote {
  serviceType: ShippingServiceType;
  shippingCost: number;
}