
import { OrderRepository } from
  '../../domain/repositories/order.repository';

import type { OrderSummary } from
  '../../domain/repositories/order.repository';

export class GetMyOrdersUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(userId: number): Promise<OrderSummary[]> {
    return this.orderRepository.findManyByUserId(userId);
  }
}
