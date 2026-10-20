
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
  productId: number;
  quantity: number;
}

export class UpdateCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(data: UpdateCartItemData): Promise<Cart> {
    // 1. Validasi jumlah produk.
    if (
      !Number.isSafeInteger(data.quantity) ||
      data.quantity <= 0
    ) {
      throw new InvalidCartQuantityError();
    }

    // 2. Pastikan keranjang tersedia.
    const cart = await this.cartRepository.findById(
      data.cartId,
    );

    if (!cart) {
      throw new CartNotFoundError();
    }

    // 3. Pastikan produk sudah ada dalam keranjang.
    const existingItem = cart.getItems().find(
      (item) => item.product.id === data.productId,
    );

    if (!existingItem) {
      throw new CartItemNotFoundError();
    }

    // 4. Ambil stok produk terbaru.
    const product = await this.productRepository.findById(
      data.productId,
    );

    if (!product) {
      throw new ProductNotFoundError();
    }

    // 5. Periksa apakah jumlah baru melebihi stok.
    if (data.quantity > product.stock) {
      throw new InsufficientStockError();
    }

    // 6. Simpan jumlah yang baru.
    return this.cartRepository.updateItem(
      data.cartId,
      data.productId,
      data.quantity,
    );
  }
}
