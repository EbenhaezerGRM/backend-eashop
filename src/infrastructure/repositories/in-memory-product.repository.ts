import { Product } from '../../domain/entities/product.entity';

import {
  ProductRepository,
  CreateProductData,
} from '../../domain/repositories/product.repository';

export class InMemoryProductRepository
  extends ProductRepository {

  private products: Product[] = [
    new Product(
      1,
      'Sepatu Sneakers',
      'Sepatu nyaman untuk aktivitas sehari-hari',
      500000,
      'Fashion',
      15,
      1,
    ),

    new Product(
      2,
      'Tas Wanita',
      'Tas wanita dengan desain elegan',
      250000,
      'Fashion',
      20,
      2,
    ),

    new Product(
      3,
      'Headphone Wireless',
      'Headphone tanpa kabel dengan suara jernih',
      350000,
      'Electronics',
      10,
      1,
    ),
  ];

  async findAll(): Promise<Product[]> {
    return [...this.products];
  }

  async findById(id: number): Promise<Product | null> {
    return this.products.find(
      (product) => product.id === id,
    ) ?? null;
  }

  async findBySellerId(sellerId: number): Promise<Product[]> {
    return this.products.filter(
      (product) => product.sellerId === sellerId,
    );
  }

  async deleteByIdAndSellerId(
    id: number,
    sellerId: number,
  ): Promise<boolean> {
    const index = this.products.findIndex(
      (product) =>
        product.id === id &&
        product.sellerId === sellerId,
    );

    if (index === -1) {
      return false;
    }

    this.products.splice(index, 1);

    return true;
  }

  async search(query: string): Promise<Product[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const id = Number(trimmedQuery);

    if (Number.isSafeInteger(id) && id > 0) {
      return this.products.filter(
        (product) => product.id === id,
      );
    }

    const normalizedQuery = trimmedQuery.toLowerCase();

    return this.products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(normalizedQuery),
    );
  }

  async create(
    data: CreateProductData,
  ): Promise<Product> {
    const nextId =
      Math.max(
        0,
        ...this.products.map((product) => product.id),
      ) + 1;

    const product = new Product(
      nextId,
      data.name,
      data.description,
      data.price,
      data.category,
      data.stock,
      data.sellerId,
    );

    this.products.push(product);

    return product;
  }
}