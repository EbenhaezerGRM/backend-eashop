
import { CreateProductUseCase } from
  './create-product.use-case';

import { Product } from
  '../../domain/entities/product.entity';

import { Seller } from
  '../../domain/entities/seller.entity';

import {
  ProductRepository,
} from '../../domain/repositories/product.repository';

import {
  SellerRepository,
} from '../../domain/repositories/seller.repository';

import { SellerAccountRequiredError } from
  '../../domain/errors/seller.errors';

import { CreateProductInput } from
  './create-product.use-case';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;

  let mockProductRepository: jest.Mocked<ProductRepository>;
  let mockSellerRepository: jest.Mocked<SellerRepository>;

  const userId = 42;

  const seller = new Seller(
    1,
    userId,
    'Toko Test',
    'Toko untuk pengujian',
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    mockProductRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      search: jest.fn(),
      findBySellerId:jest.fn()
    };

    mockSellerRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
    };

    mockSellerRepository.findByUserId.mockResolvedValue(seller);

    useCase = new CreateProductUseCase(
      mockProductRepository,
      mockSellerRepository,
    );
  });

  it('berhasil membuat produk dengan sellerId dari akun yang login', async () => {
    const input: CreateProductInput = {
      name: 'Laptop',
      description: 'Laptop untuk kebutuhan kerja',
      price: 8000000,
      category: 'Electronics',
      stock: 10,
    };

    const expectedProduct = new Product(
      10,
      'Laptop',
      'Laptop untuk kebutuhan kerja',
      8000000,
      'Electronics',
      10,
      1,
    );

    mockProductRepository.create.mockResolvedValue(
      expectedProduct,
    );

    const result = await useCase.execute(input, userId);

    expect(mockSellerRepository.findByUserId)
      .toHaveBeenCalledWith(userId);

    expect(mockProductRepository.create)
      .toHaveBeenCalledTimes(1);

    expect(mockProductRepository.create)
      .toHaveBeenCalledWith({
        ...input,
        sellerId: 1,
      });

    expect(result).toEqual(expectedProduct);
    expect(result.sellerId).toBe(1);
  });

  it('menolak membuat produk jika user belum memiliki akun Seller', async () => {
    const input: CreateProductInput = {
      name: 'Keyboard',
      description: 'Keyboard mekanik',
      price: 450000,
      category: 'Electronics',
      stock: 30,
    };

    mockSellerRepository.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute(input, userId),
    ).rejects.toBeInstanceOf(
      SellerAccountRequiredError,
    );

    expect(mockProductRepository.create)
      .not.toHaveBeenCalled();
  });
});
