
export class PaymentOrderNotFoundError extends Error {
  constructor() {
    super('Pesanan tidak ditemukan');
    this.name = 'PaymentOrderNotFoundError';
  }
}

export class PaymentOrderNotPayableError extends Error {
  constructor() {
    super('Pesanan tidak dapat dibayar');
    this.name = 'PaymentOrderNotPayableError';
  }
}
