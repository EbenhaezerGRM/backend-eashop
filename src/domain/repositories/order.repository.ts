import type { ShippingServiceType } from '../types/shipping-quote';

import type {
  PromoSource,
  VoucherType,
} from '../entities/promo.entity';

export interface CreateOrderItemInput {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
}

export interface CreateOrderInput {
  userId: number;
  cartId: number;
  addressId: number;

  subtotal: number;
  productDiscount: number;
  shippingService: ShippingServiceType;
  shippingCost: number;
  shippingDiscount: number;
  totalPayable: number;

  items: CreateOrderItemInput[];
  promos: CreateOrderPromoInput[];
}

export interface CreatedOrder {
  id: number;
  userId: number;
  addressId: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';

  subtotal: number;
  productDiscount: number;
  shippingService: string;
  shippingCost: number;
  shippingDiscount: number;
  totalPayable: number;

  createdAt: Date;

  items: {
    id: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineSubtotal: number;
  }[];
}

export abstract class OrderRepository {
  abstract createFromCheckout(
    data: CreateOrderInput,
  ): Promise<CreatedOrder>;
  
  abstract findManyByUserId(
  userId: number,
    ): Promise<OrderSummary[]>;

    abstract findByIdAndUserId(
    id: number,
    userId: number,
    ): Promise<OrderDetail | null>;

    abstract cancelPendingOrder(
    id: number,
    userId: number,
    ): Promise<CancelledOrder>;

    abstract hasUserUsedPromo(
      userId: number,
      promoId: number,
    ): Promise<boolean>;
    }


    export interface OrderSummary {
    id: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    subtotal: number;
    productDiscount: number;
    shippingService: string;
    shippingCost: number;
    shippingDiscount: number;
    totalPayable: number;
    createdAt: Date;

    items: {
        productName: string;
        unitPrice: number;
        quantity: number;
        lineSubtotal: number;
    }[];
    }

export interface OrderDetail extends OrderSummary {
  userId: number;
  addressId: number;

  address: {
    id: number;
    recipientName: string;
    phone: string;
    street: string;
    city: string;
    province: string;
    district: string | null;
    postalCode: string | null;
    notes: string | null;
  };

  promos: {
    promoId: number;
    source: PromoSource;
    voucherType: VoucherType;
    discountAmount: number;
    promoName: string;
  }[];
}

export interface CancelledOrder {
  id: number;
  status: 'CANCELLED';
}

export interface CreateOrderPromoInput {
  promoId: number;
  source: PromoSource;
  voucherType: VoucherType;
  discountAmount: number;
}
