import { Cart } from '../../domain/entities/cart.entity';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

import { ProductRepository } from
  '../../domain/repositories/product.repository';

import {
  ProductNotFoundError,
  InsufficientStockError,
  InvalidCartQuantityError,
} from '../../domain/errors/cart.errors';

export interface AddCartItemData {
  userId: number;
  productId: number;
  quantity: number;
}

export class AddCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(data: AddCartItemData): Promise<Cart> {
    // 1. Validasi jumlah pembelian
    if (
      !Number.isSafeInteger(data.quantity) ||
      data.quantity <= 0
    ) {
      throw new InvalidCartQuantityError();
    }

    // 2. Cari keranjang berdasarkan user
    let cart = await this.cartRepository.findByUserId(
      data.userId,
    );

    // 3. Jika cart belum ada, buat cart baru
    if (!cart) {
      cart = await this.cartRepository.create(
        data.userId,
      );
    }

    // 4. Cari produk dan ambil stok terbarunya
    const product = await this.productRepository.findById(
      data.productId,
    );

    if (!product) {
      throw new ProductNotFoundError();
    }

    // 5. Periksa apakah produk sudah ada di keranjang
    const existingItem = cart.getItems().find(
      (item) => item.product.id === data.productId,
    );

    const currentQuantity = existingItem?.quantity ?? 0;

    // 6. Hitung total jumlah setelah penambahan
    const requestedQuantity =
      currentQuantity + data.quantity;

    // 7. Periksa ketersediaan stok
    if (requestedQuantity > product.stock) {
      throw new InsufficientStockError();
    }

    // 8. Simpan perubahan melalui repository
    return this.cartRepository.addItem(
      cart.id,
      data.productId,
      data.quantity,
    );
  }
}