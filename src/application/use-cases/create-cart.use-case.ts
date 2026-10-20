import { Cart } from '../../domain/entities/cart.entity';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

export class CreateCartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(userId: number): Promise<Cart> {
    return this.cartRepository.create(userId);
  }
}
