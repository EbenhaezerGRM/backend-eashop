
import { Injectable, Inject } from '@nestjs/common';

import { Product } from '../../domain/entities/product.entity';

import {
  ProductRepository,
  CreateProductData,
} from '../../domain/repositories/product.repository';

import { PrismaService } from '../database/prisma.service';

import { ProductCannotBeDeletedError } from '../../domain/errors/product.errors';

@Injectable()
export class PrismaProductRepository
  extends ProductRepository {

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();

    return products.map(
      (product) =>
        new Product(
          product.id,
          product.name,
          product.description,
          product.price,
          product.category,
          product.stock,
          product.sellerId,
        ),
    );
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return null;
    }

    return new Product(
      product.id,
      product.name,
      product.description,
      product.price,
      product.category,
      product.stock,
      product.sellerId,
    );
  }

  async findBySellerId(sellerId: number): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        sellerId,
      },
    });

    return products.map(
      (product) =>
        new Product(
          product.id,
          product.name,
          product.description,
          product.price,
          product.category,
          product.stock,
          product.sellerId,
        ),
    );
  }

  async search(query: string): Promise<Product[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const id = Number(trimmedQuery);

    const products = Number.isSafeInteger(id) && id > 0
      ? await this.prisma.product.findMany({
          where: {
            id,
          },
        })
      : await this.prisma.product.findMany({
          where: {
            name: {
              contains: trimmedQuery,
              mode: 'insensitive',
            },
          },
        });

    return products.map(
      (product) =>
        new Product(
          product.id,
          product.name,
          product.description,
          product.price,
          product.category,
          product.stock,
          product.sellerId,
        ),
    );
  }

  async deleteByIdAndSellerId(
  id: number,
  sellerId: number,
): Promise<boolean> {
  try {
    const result = await this.prisma.product.deleteMany({
      where: {
        id,
        sellerId,
      },
    });

    return result.count > 0;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2003'
    ) {
      throw new ProductCannotBeDeletedError();
    }

    throw error;
  }
}

  async create(
    data: CreateProductData,
  ): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
        sellerId: data.sellerId,
      },
    });

    return new Product(
      product.id,
      product.name,
      product.description,
      product.price,
      product.category,
      product.stock,
      product.sellerId,
    );
  }
}
