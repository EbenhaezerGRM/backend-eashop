import { Product } from '../entities/product.entity';

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sellerId: number;
}

export abstract class ProductRepository {
  abstract findAll(): Promise<Product[]>;

  abstract findById(
    id: number,
  ): Promise<Product | null>;

  abstract create(
    data: CreateProductData,
  ): Promise<Product>;

  abstract search(
  query: string,
  ): Promise<Product[]>;
}
