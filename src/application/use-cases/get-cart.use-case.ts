import { Cart } from '../../domain/entities/cart.entity';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

export class GetCartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(id: number): Promise<Cart | null> {
    return this.cartRepository.findById(id);
  }
}
