
import { Product } from './product.entity';

export class CartItem {
  constructor(
    public readonly product: Product,
    public readonly quantity: number,
  ) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(
        'Jumlah produk harus berupa bilangan bulat positif',
      );
    }
  }

  getSubtotal(): number {
    return this.product.price * this.quantity;
  }

  getRemainingStock(): number {
    return Math.max(
      0,
      this.product.stock - this.quantity,
    );
  }
}
