
import { OrderRepository } from
  '../../domain/repositories/order.repository';

import type { CancelledOrder } from
  '../../domain/repositories/order.repository';

export class CancelOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(
    id: number,
    userId: number,
  ): Promise<CancelledOrder> {
    return this.orderRepository.cancelPendingOrder(
      id,
      userId,
    );
  }
}
