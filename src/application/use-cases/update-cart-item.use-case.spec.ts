
import { UpdateCartItemUseCase } from
  './update-cart-item.use-case';

import { Cart } from
  '../../domain/entities/cart.entity';

import { CartItem } from
  '../../domain/entities/cart-item.entity';

import { Product } from
  '../../domain/entities/product.entity';

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

describe('UpdateCartItemUseCase', () => {
  let useCase: UpdateCartItemUseCase;

  let mockCartRepository: jest.Mocked<CartRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  let cart: Cart;
  let product: Product;

  beforeEach(() => {
    // Produk memiliki stok sebanyak 10 unit.
    product = new Product(
      2,
      'Sepatu Sneakers',
      'Sepatu nyaman untuk aktivitas sehari-hari',
      500000,
      'Fashion',
      10,
    );

    // Keranjang awal berisi 3 unit produk.
    cart = new Cart(1, 100);
    cart.addItem(new CartItem(product, 3));

    // Buat mock CartRepository.
    mockCartRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      findByUserId: jest.fn(),
    };

    // Buat mock ProductRepository.
    mockProductRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      search: jest.fn(),
    };

    // Tentukan data awal yang dikembalikan mock.
    mockCartRepository.findById.mockResolvedValue(cart);

    mockProductRepository.findById.mockResolvedValue(
      product,
    );

    useCase = new UpdateCartItemUseCase(
      mockCartRepository,
      mockProductRepository,
    );
  });

  it('berhasil memperbarui jumlah produk', async () => {
    // Simulasikan hasil repository setelah update.
    const updatedCart = new Cart(1, 100);
    updatedCart.addItem(new CartItem(product, 2));

    mockCartRepository.updateItem.mockResolvedValue(
      updatedCart,
    );

    const result = await useCase.execute({
      cartId: 1,
      userId: 1,
      productId: 2,
      quantity: 2,
    });

    expect(
      mockCartRepository.updateItem,
    ).toHaveBeenCalledWith(1, 2, 2);

    expect(
      mockCartRepository.updateItem,
    ).toHaveBeenCalledTimes(1);

    expect(result.getItems()[0].quantity).toBe(2);
    expect(result.getTotal()).toBe(1000000);
  });

  it('mengizinkan jumlah tepat sama dengan stok', async () => {
    const updatedCart = new Cart(1, 100);
    updatedCart.addItem(new CartItem(product, 10));

    mockCartRepository.updateItem.mockResolvedValue(
      updatedCart,
    );

    const result = await useCase.execute({
      cartId: 1,
      userId: 1,
      productId: 2,
      quantity: 10,
    });

    expect(
      mockCartRepository.updateItem,
    ).toHaveBeenCalledWith(1, 2, 10);

    expect(result.getItems()[0].quantity).toBe(10);
    expect(result.getItems()[0].getRemainingStock())
      .toBe(0);
  });

  it('menolak jumlah yang melebihi stok', async () => {
    await expect(
      useCase.execute({
        cartId: 1,
        userId: 1,
        productId: 2,
        quantity: 11,
      }),
    ).rejects.toBeInstanceOf(
      InsufficientStockError,
    );

    expect(
      mockCartRepository.updateItem,
    ).not.toHaveBeenCalled();
  });

  it('menolak jika keranjang tidak ditemukan', async () => {
    mockCartRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      useCase.execute({
        cartId: 999,
        userId: 1,
        productId: 2,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(
      CartNotFoundError,
    );

    expect(
      mockCartRepository.updateItem,
    ).not.toHaveBeenCalled();
  });

  it('menolak jika item tidak ada di keranjang', async () => {
    await expect(
      useCase.execute({
        cartId: 1,
        userId: 1,
        productId: 999,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(
      CartItemNotFoundError,
    );

    expect(
      mockCartRepository.updateItem,
    ).not.toHaveBeenCalled();
  });

  it('menolak jika produk tidak ditemukan', async () => {
    mockProductRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      useCase.execute({
        cartId: 1,
        userId: 1,
        productId: 2,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );

    expect(
      mockCartRepository.updateItem,
    ).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5])(
    'menolak jumlah tidak valid: %s',
    async (quantity) => {
      await expect(
        useCase.execute({
          cartId: 1,
          userId: 1,
          productId: 2,
          quantity,
        }),
      ).rejects.toBeInstanceOf(
        InvalidCartQuantityError,
      );

      expect(
        mockCartRepository.updateItem,
      ).not.toHaveBeenCalled();
    },
  );
});
