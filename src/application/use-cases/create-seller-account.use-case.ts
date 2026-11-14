
import { SellerRepository } from
  '../../domain/repositories/seller.repository';

import { SellerAlreadyExistsError } from
  '../../domain/errors/seller.errors';

export interface CreateSellerAccountInput {
  userId: number;
  storeName: string;
  description?: string;
}

export class CreateSellerAccountUseCase {
  constructor(
    private readonly sellerRepository: SellerRepository,
  ) {}

  async execute(data: CreateSellerAccountInput) {
    const existingSeller =
      await this.sellerRepository.findByUserId(data.userId);

    if (existingSeller) {
      throw new SellerAlreadyExistsError();
    }

    const storeName = data.storeName.trim();

    if (!storeName) {
      throw new Error('Nama toko tidak boleh kosong');
    }

    return this.sellerRepository.create({
      userId: data.userId,
      storeName,
      description: data.description?.trim() || null,
    });
  }
}
