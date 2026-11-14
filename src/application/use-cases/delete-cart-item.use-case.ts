import { Cart } from '../../domain/entities/cart.entity';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

import {
  CartNotFoundError,
  CartItemNotFoundError,
} from '../../domain/errors/cart.errors';

export interface DeleteCartItemData {
  cartId: number;
  productId: number;
  userId: number;
}

export class DeleteCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(data: DeleteCartItemData): Promise<Cart> {
    const cart = await this.cartRepository.findById(
      data.cartId,
    );

    // Cart tidak ditemukan atau bukan milik user yang login.
    if (!cart || cart.userId !== data.userId) {
      throw new CartNotFoundError();
    }

    const existingItem = cart.getItems().find(
      (item) => item.product.id === data.productId,
    );

    if (!existingItem) {
      throw new CartItemNotFoundError();
    }

    return this.cartRepository.deleteItem(
      data.cartId,
      data.productId,
    );
  }
}