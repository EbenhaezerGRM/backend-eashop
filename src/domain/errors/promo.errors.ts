export class InvalidPromoCombinationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPromoCombinationError';
  }
}

export class InvalidPromoInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPromoInputError';
  }
}

export class PromoNotFoundError extends Error {
  constructor() {
    super('Promo tidak ditemukan');
    this.name = 'PromoNotFoundError';
  }
}

export class InvalidPromoSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPromoSelectionError';
  }
}