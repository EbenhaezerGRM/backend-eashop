
import { CartItem } from './cart-item.entity';

export class Cart {
  private items: CartItem[] = [];

  constructor(
    public readonly id: number,
    public readonly userId: number,
  ) {}

  addItem(item: CartItem): void {
    const existingIndex = this.items.findIndex(
      (existingItem) =>
        existingItem.product.id === item.product.id,
    );

    if (existingIndex !== -1) {
      const existingItem = this.items[existingIndex];

      this.items[existingIndex] = new CartItem(
        existingItem.product,
        existingItem.quantity + item.quantity,
      );
    } else {
      this.items.push(item);
    }
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getTotal(): number {
    return this.items.reduce(
      (total, item) => total + item.getSubtotal(),
      0,
    );
  }
}
