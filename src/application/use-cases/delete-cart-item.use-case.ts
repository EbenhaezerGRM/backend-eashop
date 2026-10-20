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
}

export class DeleteCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(data: DeleteCartItemData): Promise<Cart> {

    // 1. Cari keranjang
    const cart = await this.cartRepository.findById(
      data.cartId,
    );

    if (!cart) {
      throw new CartNotFoundError();
    }

    // 2. Periksa apakah produk ada di keranjang
    const existingItem = cart.getItems().find(
      (item) => item.product.id === data.productId,
    );

    if (!existingItem) {
      throw new CartItemNotFoundError();
    }

    // 3. Hapus item melalui repository
    return this.cartRepository.deleteItem(
      data.cartId,
      data.productId,
    );
  }
}