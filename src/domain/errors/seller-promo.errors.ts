export class SellerPromoNotFoundError extends Error {
  constructor() {
    super('Voucher tidak ditemukan atau bukan milik toko Anda');
    this.name = 'SellerPromoNotFoundError';
  }
}

export class SellerPromoCannotBeDeletedError extends Error {
  constructor() {
    super('Voucher tidak dapat dihapus karena masih memiliki data terkait');
    this.name = 'SellerPromoCannotBeDeletedError';
  }
}