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

  async executeForUser(
    id: number,
    userId: number,
  ): Promise<Cart | null> {
    const cart = await this.cartRepository.findById(id);

    if (!cart || cart.userId !== userId) {
      return null;
    }

    return cart;
  }

  async executeByUserId(userId: number): Promise<Cart | null> {
  return this.cartRepository.findByUserId(userId);
}
}
