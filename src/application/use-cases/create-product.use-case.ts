import { Product } from '../../domain/entities/product.entity';

import {
  ProductRepository,
  CreateProductData,
} from '../../domain/repositories/product.repository';

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(data: CreateProductData): Promise<Product> {
    return this.productRepository.create(data);
  }
}