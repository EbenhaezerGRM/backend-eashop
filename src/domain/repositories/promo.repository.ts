import { Promo } from '../entities/promo.entity';

export abstract class PromoRepository {

  abstract findAll(): Promise<Promo[]>;

  abstract findById(
    id: number,
  ): Promise<Promo | null>;

  abstract findByIds(
    ids: number[],
  ): Promise<Promo[]>;

  abstract create(
    promo: Promo,
  ): Promise<Promo>;

}
