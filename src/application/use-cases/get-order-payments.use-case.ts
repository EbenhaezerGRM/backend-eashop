
import { PaymentRepository } from '../../domain/repositories/payment.repository';

export class GetOrderPaymentsUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(orderId: number, userId: number) {
    return this.paymentRepository.findPaymentsByOrder(
      orderId,
      userId,
    );
  }
}
