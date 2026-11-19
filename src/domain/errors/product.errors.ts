export class ProductNotFoundError extends Error {
  constructor() {
    super('Produk tidak ditemukan atau bukan milik toko Anda');
    this.name = 'ProductNotFoundError';
  }
}

export class ProductCannotBeDeletedError extends Error {
  constructor() {
    super('Produk tidak dapat dihapus karena masih memiliki data terkait');
    this.name = 'ProductCannotBeDeletedError';
  }
}