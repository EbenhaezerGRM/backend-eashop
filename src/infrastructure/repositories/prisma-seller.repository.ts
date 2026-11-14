
import { PrismaService } from '../database/prisma.service';

import { Seller } from '../../domain/entities/seller.entity';

import {
  SellerRepository,
  CreateSellerData,
} from '../../domain/repositories/seller.repository';

import { SellerAlreadyExistsError } from
  '../../domain/errors/seller.errors';

export class PrismaSellerRepository extends SellerRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: number): Promise<Seller | null> {
    const record = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!record) {
      return null;
    }

    return new Seller(
      record.id,
      record.userId,
      record.storeName,
      record.description,
      record.createdAt,
      record.updatedAt,
    );
  }

  async create(data: CreateSellerData): Promise<Seller> {
    try {
      const record = await this.prisma.seller.create({
        data: {
          userId: data.userId,
          storeName: data.storeName,
          description: data.description,
        },
      });

      return new Seller(
        record.id,
        record.userId,
        record.storeName,
        record.description,
        record.createdAt,
        record.updatedAt,
      );
    } catch (error) {
      // Menangani kemungkinan dua request pendaftaran bersamaan.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new SellerAlreadyExistsError();
      }

      throw error;
    }
  }
}
