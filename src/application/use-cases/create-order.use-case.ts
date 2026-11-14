
import type {
  CheckoutUseCase,
  CheckoutInput,
} from './checkout-use-case';

import type {
  OrderRepository,
  CreatedOrder,
} from '../../domain/repositories/order.repository';

export interface CreateOrderUseCaseInput
  extends CheckoutInput {
  addressId: number;
}

export class CreateOrderUseCase {
  constructor(
    private readonly checkoutUseCase: CheckoutUseCase,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(
    data: CreateOrderUseCaseInput,
  ): Promise<CreatedOrder> {

    // 1. Hitung ulang checkout di backend.
    const {
      cart,
      summary,
      promos,
    } = await this.checkoutUseCase.prepare(data);

    // 2. Siapkan data produk dari Cart.
    const items = cart.getItems().map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      unitPrice: item.product.price,
      quantity: item.quantity,
      lineSubtotal: item.getSubtotal(),
    }));

    // 3. Buat Order melalui repository.
    return this.orderRepository.createFromCheckout({
      userId: data.userId,
      cartId: data.cartId,
      addressId: data.addressId,

      subtotal: summary.subtotal,
      productDiscount: summary.productDiscount,

      shippingService: summary.shipping.serviceType,
      shippingCost: summary.shipping.shippingCost,
      shippingDiscount: summary.shippingDiscount,

      totalPayable: summary.totalPayable,

      items,
      promos,
    });
  }
}
