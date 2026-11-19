export class SellerAlreadyExistsError extends Error {
  constructor() {
    super('User sudah memiliki akun Seller');
    this.name = 'SellerAlreadyExistsError';
  }
}

export class SellerAccountRequiredError extends Error {
  constructor() {
    super('Kamu harus memiliki akun Seller terlebih dahulu');
    this.name = 'SellerAccountRequiredError';
  }
}
