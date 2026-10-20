export class CartNotFoundError extends Error {
  constructor() {
    super('Keranjang tidak ditemukan');
    this.name = 'CartNotFoundError';
  }
}

export class ProductNotFoundError extends Error {
  constructor() {
    super('Produk tidak ditemukan');
    this.name = 'ProductNotFoundError';
  }
}

export class InsufficientStockError extends Error {
  constructor() {
    super('Jumlah produk melebihi stok tersedia');
    this.name = 'InsufficientStockError';
  }
}

export class InvalidCartQuantityError extends Error {
  constructor() {
    super(
      'Jumlah produk harus berupa bilangan bulat positif',
    );
    this.name = 'InvalidCartQuantityError';
  }
}

export class CartItemNotFoundError extends Error {
  constructor() {
    super('Produk tidak ditemukan dalam keranjang');
    this.name = 'CartItemNotFoundError';
  }
}
