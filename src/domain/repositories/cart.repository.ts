import { Cart } from '../entities/cart.entity';

export abstract class CartRepository {
  abstract findById(
    id: number,
  ): Promise<Cart | null>;

  abstract findByUserId(
  userId: number,
  ): Promise<Cart | null>;

  abstract create(
    userId: number,
  ): Promise<Cart>;

  abstract addItem(
    cartId: number,
    productId: number,
    quantity: number,
  ): Promise<Cart>;

  abstract updateItem(
    cartId: number,
    productId: number,
    quantity: number,
  ): Promise<Cart>;

   abstract deleteItem(
    cartId: number,
    productId: number,
  ): Promise<Cart>;
}
