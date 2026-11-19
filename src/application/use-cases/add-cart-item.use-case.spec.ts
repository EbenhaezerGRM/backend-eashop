import { AddCartItemUseCase } from
  './add-cart-item.use-case';

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
  ProductNotFoundError,
  InsufficientStockError,
  InvalidCartQuantityError,
} from '../../domain/errors/cart.errors';

describe('AddCartItemUseCase', () => {
  let useCase: AddCartItemUseCase;

  let mockCartRepository: jest.Mocked<CartRepository>;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  let cart: Cart;
  let product: Product;

  beforeEach(() => {
    // Siapkan produk dengan stok 10.
    product = new Product(
      2,
      'Sepatu Sneakers',
      'Sepatu nyaman untuk aktivitas sehari-hari',
      500000,
      'Fashion',
      10,
    );

    // Siapkan keranjang kosong.
    cart = new Cart(1, 100);

    // Buat repository tiruan.
    mockCartRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
    };

    mockProductRepository = {
      findAll: jest.fn(),
      search: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findBySellerId: jest.fn(),
    };

    // Default: user sudah memiliki cart.
    mockCartRepository.findByUserId.mockResolvedValue(cart);

    mockProductRepository.findById.mockResolvedValue(
      product,
    );

    mockCartRepository.addItem.mockResolvedValue(cart);

    // Masukkan mock ke dalam use case.
    useCase = new AddCartItemUseCase(
      mockCartRepository,
      mockProductRepository,
    );
  });

  it('berhasil menambahkan produk ke keranjang', async () => {
    const result = await useCase.execute({
      userId: 100,
      productId: 2,
      quantity: 2,
    });

    expect(mockCartRepository.findByUserId)
      .toHaveBeenCalledWith(100);

    expect(mockCartRepository.addItem)
      .toHaveBeenCalledWith(1, 2, 2);

    expect(mockCartRepository.addItem)
      .toHaveBeenCalledTimes(1);

    expect(result).toBe(cart);
  });

  it('otomatis membuat cart jika user belum memiliki cart', async () => {
    const newCart = new Cart(10, 100);

    mockCartRepository.findByUserId
      .mockResolvedValue(null);

    mockCartRepository.create
      .mockResolvedValue(newCart);

    mockCartRepository.addItem
      .mockResolvedValue(newCart);

    const result = await useCase.execute({
      userId: 100,
      productId: 2,
      quantity: 2,
    });

    expect(mockCartRepository.findByUserId)
      .toHaveBeenCalledWith(100);

    expect(mockCartRepository.create)
      .toHaveBeenCalledWith(100);

    expect(mockCartRepository.create)
      .toHaveBeenCalledTimes(1);

    expect(mockCartRepository.addItem)
      .toHaveBeenCalledWith(10, 2, 2);

    expect(result).toBe(newCart);
  });

  it('menolak jika jumlah melebihi stok', async () => {
    // Produk sudah ada sebanyak 7 unit.
    cart.addItem(new CartItem(product, 7));

    // Tambahan 4 unit akan menghasilkan 11.
    await expect(
      useCase.execute({
        userId: 100,
        productId: 2,
        quantity: 4,
      }),
    ).rejects.toBeInstanceOf(
      InsufficientStockError,
    );

    // Repository tidak boleh menyimpan perubahan.
    expect(mockCartRepository.addItem)
      .not.toHaveBeenCalled();
  });

  it('mengizinkan jumlah tepat sama dengan stok', async () => {
    // Sudah ada 7, kemudian ditambah 3.
    cart.addItem(new CartItem(product, 7));

    await useCase.execute({
      userId: 100,
      productId: 2,
      quantity: 3,
    });

    expect(mockCartRepository.addItem)
      .toHaveBeenCalledWith(1, 2, 3);
  });

  it('menolak jika produk tidak ditemukan', async () => {
    mockProductRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      useCase.execute({
        userId: 100,
        productId: 999,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );

    expect(mockCartRepository.addItem)
      .not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5])(
    'menolak jumlah tidak valid: %s',
    async (quantity) => {
      await expect(
        useCase.execute({
          userId: 100,
          productId: 2,
          quantity,
        }),
      ).rejects.toBeInstanceOf(
        InvalidCartQuantityError,
      );

      expect(mockCartRepository.addItem)
        .not.toHaveBeenCalled();
    },
  );
});