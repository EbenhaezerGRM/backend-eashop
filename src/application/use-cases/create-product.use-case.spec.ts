
import { CreateProductUseCase } from
  './create-product.use-case';

import { Product } from
  '../../domain/entities/product.entity';

import {
  ProductRepository,
  CreateProductData,
} from '../../domain/repositories/product.repository';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      search: jest.fn(),
    };

    useCase = new CreateProductUseCase(
      mockRepository,
    );
  });

  it('meneruskan data produk dan sellerId ke repository', async () => {
    const input: CreateProductData = {
      name: 'Laptop',
      description: 'Laptop untuk kebutuhan kerja',
      price: 8000000,
      category: 'Electronics',
      stock: 10,
      sellerId: 1,
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

    mockRepository.create.mockResolvedValue(
      expectedProduct,
    );

    await useCase.execute(input);

    expect(mockRepository.create)
      .toHaveBeenCalledTimes(1);

    expect(mockRepository.create)
      .toHaveBeenCalledWith(input);
  });

  it('mengembalikan produk dengan sellerId yang sesuai', async () => {
    const input: CreateProductData = {
      name: 'Keyboard',
      description: 'Keyboard mekanik',
      price: 450000,
      category: 'Electronics',
      stock: 30,
      sellerId: 2,
    };

    const expectedProduct = new Product(
      11,
      'Keyboard',
      'Keyboard mekanik',
      450000,
      'Electronics',
      30,
      2,
    );

    mockRepository.create.mockResolvedValue(
      expectedProduct,
    );

    const result = await useCase.execute(input);

    expect(result).toEqual(expectedProduct);
    expect(result.sellerId).toBe(2);
  });
});
