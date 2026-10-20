import { Product } from '../../domain/entities/product.entity';

import { ProductRepository } from '../../domain/repositories/product.repository';

export class SearchProductsUseCase {

  constructor(
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(query: string): Promise<Product[]> {
    return this.productRepository.search(query);
  }

}