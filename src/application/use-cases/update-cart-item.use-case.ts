import { Cart } from '../../domain/entities/cart.entity';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

import { ProductRepository } from
  '../../domain/repositories/product.repository';

import {
  CartNotFoundError,
  CartItemNotFoundError,
  ProductNotFoundError,
  InsufficientStockError,
  InvalidCartQuantityError,
} from '../../domain/errors/cart.errors';

export interface UpdateCartItemData {
  cartId: number;
  userId: number;
  productId: number;
  quantity: number;
}

export class UpdateCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(data: UpdateCartItemData): Promise<Cart> {
    if (
      !Number.isSafeInteger(data.quantity) ||
      data.quantity <= 0
    ) {
      throw new InvalidCartQuantityError();
    }

    // Cari cart dan pastikan milik user yang login.
    const cart = await this.cartRepository.findById(
      data.cartId,
    );

    if (!cart || cart.userId !== data.userId) {
      throw new CartNotFoundError();
    }

    const existingItem = cart.getItems().find(
      (item) => item.product.id === data.productId,
    );

    if (!existingItem) {
      throw new CartItemNotFoundError();
    }

    const product = await this.productRepository.findById(
      data.productId,
    );

    if (!product) {
      throw new ProductNotFoundError();
    }

    if (data.quantity > product.stock) {
      throw new InsufficientStockError();
    }

    return this.cartRepository.updateItem(
      data.cartId,
      data.productId,
      data.quantity,
    );
  }
}