
import { DeleteCartItemUseCase } from
  './delete-cart-item.use-case';

import { Cart } from
  '../../domain/entities/cart.entity';

import { CartItem } from
  '../../domain/entities/cart-item.entity';

import { Product } from
  '../../domain/entities/product.entity';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

import {
  CartNotFoundError,
  CartItemNotFoundError,
} from '../../domain/errors/cart.errors';

describe('DeleteCartItemUseCase', () => {
  let useCase: DeleteCartItemUseCase;
  let mockCartRepository: jest.Mocked<CartRepository>;

  let cart: Cart;
  let sneakers: Product;
  let bag: Product;

  beforeEach(() => {
    // Siapkan dua produk.
    sneakers = new Product(
      1,
      'Sepatu Sneakers',
      'Sepatu untuk aktivitas sehari-hari',
      500000,
      'Fashion',
      15,
    );

    bag = new Product(
      2,
      'Tas Wanita',
      'Tas dengan desain elegan',
      250000,
      'Fashion',
      20,
    );

    // Buat keranjang yang berisi kedua produk.
    cart = new Cart(1, 100);

    cart.addItem(new CartItem(sneakers, 2));
    cart.addItem(new CartItem(bag, 1));

    // Buat repository tiruan.
    mockCartRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
    };

    mockCartRepository.findById.mockResolvedValue(
      cart,
    );

    useCase = new DeleteCartItemUseCase(
      mockCartRepository,
    );
  });

  it('berhasil menghapus produk dari keranjang', async () => {
    // Simulasikan hasil repository setelah penghapusan.
    const updatedCart = new Cart(1, 100);

    updatedCart.addItem(
      new CartItem(bag, 1),
    );

    mockCartRepository.deleteItem.mockResolvedValue(
      updatedCart,
    );

    // Jalankan use case.
    const result = await useCase.execute({
      cartId: 1,
      productId: 1,
    });

    // Pastikan repository dipanggil dengan ID tepat.
    expect(
      mockCartRepository.deleteItem,
    ).toHaveBeenCalledWith(1, 1);

    expect(
      mockCartRepository.deleteItem,
    ).toHaveBeenCalledTimes(1);

    // Pastikan hasil repository dikembalikan use case.
    expect(result).toBe(updatedCart);
    expect(result.getItems()).toHaveLength(1);
    expect(result.getItems()[0].product.id).toBe(2);
  });

  it('menolak jika keranjang tidak ditemukan', async () => {
    mockCartRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      useCase.execute({
        cartId: 999,
        productId: 1,
      }),
    ).rejects.toBeInstanceOf(
      CartNotFoundError,
    );

    expect(
      mockCartRepository.deleteItem,
    ).not.toHaveBeenCalled();
  });

  it('menolak jika produk tidak ada dalam keranjang', async () => {
    await expect(
      useCase.execute({
        cartId: 1,
        productId: 999,
      }),
    ).rejects.toBeInstanceOf(
      CartItemNotFoundError,
    );

    expect(
      mockCartRepository.deleteItem,
    ).not.toHaveBeenCalled();
  });
});
