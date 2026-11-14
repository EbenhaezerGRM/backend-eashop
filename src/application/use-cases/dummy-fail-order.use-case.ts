
import { PaymentRepository } from '../../domain/repositories/payment.repository';

export class DummyFailOrderUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(orderId: number, userId: number) {
    return this.paymentRepository.failOrder(orderId, userId);
  }
}
