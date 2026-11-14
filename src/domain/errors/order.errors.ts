
export class OrderAddressNotFoundError extends Error {
  constructor() {
    super('Alamat tidak ditemukan atau bukan milik user');
    this.name = 'OrderAddressNotFoundError';
  }
}

export class OrderCartEmptyError extends Error {
  constructor() {
    super('Keranjang belanja kosong');
    this.name = 'OrderCartEmptyError';
  }
}

export class OrderCartChangedError extends Error {
  constructor() {
    super('Isi keranjang berubah. Silakan ulangi checkout');
    this.name = 'OrderCartChangedError';
  }
}

export class OrderInsufficientStockError extends Error {
  constructor(productName: string) {
    super(`Stok produk ${productName} tidak mencukupi`);
    this.name = 'OrderInsufficientStockError';
  }
}

export class OrderPromoUnavailableError extends Error {
  constructor(promoId: number) {
    super(
      `Promo ID ${promoId} sudah tidak tersedia atau stoknya habis`,
    );
    this.name = 'OrderPromoUnavailableError';
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super('Pesanan tidak ditemukan');
    this.name = 'OrderNotFoundError';
  }
}

export class OrderCannotBeCancelledError extends Error {
  constructor() {
    super('Pesanan tidak dapat dibatalkan');
    this.name = 'OrderCannotBeCancelledError';
  }
}