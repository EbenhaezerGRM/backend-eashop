import { Seller } from '../entities/seller.entity';

export interface CreateSellerData {
  userId: number;
  storeName: string;
  description: string | null;
}

export abstract class SellerRepository {
  abstract findByUserId(userId: number): Promise<Seller | null>;

  abstract create(data: CreateSellerData): Promise<Seller>;
}
