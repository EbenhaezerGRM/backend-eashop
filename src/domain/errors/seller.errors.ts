export class SellerAlreadyExistsError extends Error {
  constructor() {
    super('User sudah memiliki akun Seller');
    this.name = 'SellerAlreadyExistsError';
  }
}
