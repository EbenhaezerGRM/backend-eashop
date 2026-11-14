
export interface PaymentRecord {
  id: number;
  orderId: number;
  provider: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  amount: number;
  transactionId: string;
  paidAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class PaymentRepository {
  abstract payOrder(
    orderId: number,
    userId: number,
  ): Promise<PaymentRecord>;

  abstract failOrder(
    orderId: number,
    userId: number,
  ): Promise<PaymentRecord>;

  abstract findPaymentsByOrder(
    orderId: number,
    userId: number,
  ): Promise<PaymentRecord[]>;
}
