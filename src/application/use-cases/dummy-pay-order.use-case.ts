
import { PaymentRepository } from '../../domain/repositories/payment.repository';

export class DummyPayOrderUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(orderId: number, userId: number) {
    return this.paymentRepository.payOrder(orderId, userId);
  }
}
