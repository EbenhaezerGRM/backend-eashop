
import { OrderRepository } from
  '../../domain/repositories/order.repository';

import type { OrderDetail } from
  '../../domain/repositories/order.repository';

export class GetOrderDetailUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(
    id: number,
    userId: number,
  ): Promise<OrderDetail | null> {
    return this.orderRepository.findByIdAndUserId(
      id,
      userId,
    );
  }
}
