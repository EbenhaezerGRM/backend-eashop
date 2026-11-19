import {
  Promo,
  type PromoSource,
} from '../entities/promo.entity';

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

  abstract deleteByIdAndSellerId(
    id: number,
    sellerId: number,
  ): Promise<boolean>;

  findBySellerId(sellerId: number): Promise<Promo[]> {
    return this.findAll().then((promos) =>
      promos.filter(
        (promo) =>
          promo.config.source === 'SELLER' &&
          promo.config.sellerId === sellerId,
      ),
    );
  }

  findBySource(source: PromoSource): Promise<Promo[]> {
    return this.findAll().then((promos) =>
      promos.filter(
        (promo) => promo.config.source === source,
      ),
    );
  }
}