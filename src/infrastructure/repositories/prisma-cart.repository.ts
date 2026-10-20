
import { Injectable, Inject } from '@nestjs/common';

import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/entities/cart-item.entity';
import { Product } from '../../domain/entities/product.entity';

import { CartNotFoundError, CartItemNotFoundError } from
  '../../domain/errors/cart.errors';

import { CartRepository } from
  '../../domain/repositories/cart.repository';

import { PrismaService } from
  '../database/prisma.service';

@Injectable()
export class PrismaCartRepository extends CartRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async findById(id: number): Promise<Cart | null> {
    const cartData = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cartData) {
      return null;
    }

    const cart = new Cart(
      cartData.id,
      cartData.userId,
    );

    for (const item of cartData.items) {  
        const product = new Product(
        item.product.id,
        item.product.name,
        item.product.description,
        item.product.price,
        item.product.category,
        item.product.stock,
        item.product.sellerId,
        );


      cart.addItem(
        new CartItem(product, item.quantity),
      );
    }

    return cart;
  }

  async findByUserId(
  userId: number,
): Promise<Cart | null> {
  const cartData = await this.prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cartData) {
    return null;
  }

  const cart = new Cart(
    cartData.id,
    cartData.userId,
  );

  for (const item of cartData.items) {
    const product = new Product(
      item.product.id,
      item.product.name,
      item.product.description,
      item.product.price,
      item.product.category,
      item.product.stock,
      item.product.sellerId,
    );

    cart.addItem(
      new CartItem(product, item.quantity),
    );
  }

  return cart;
}

  
    async addItem(
    cartId: number,
    productId: number,
    quantity: number,
    ): Promise<Cart> {
    await this.prisma.cartItem.upsert({
        where: {
        cartId_productId: {
            cartId,
            productId,
        },
        },

        update: {
        quantity: {
            increment: quantity,
        },
        },

        create: {
        cartId,
        productId,
        quantity,
        },
    });

    const cart = await this.findById(cartId);

    if (!cart) {
        throw new CartNotFoundError();
    }

    return cart;
    }

    
async updateItem(
  cartId: number,
  productId: number,
  quantity: number,
): Promise<Cart> {
  const result = await this.prisma.cartItem.updateMany({
    where: {
      cartId,
      productId,
    },
    data: {
      quantity,
    },
  });

  if (result.count === 0) {
    throw new CartItemNotFoundError();
  }

  const cart = await this.findById(cartId);

  if (!cart) {
    throw new CartNotFoundError();
  }

  return cart;
}

  async create(userId: number): Promise<Cart> {
    const cartData = await this.prisma.cart.create({
      data: {
        userId,
      },
    });

    return new Cart(
      cartData.id,
      cartData.userId,
    );
  }

  
async deleteItem(
  cartId: number,
  productId: number,
): Promise<Cart> {

  // Hapus produk dari keranjang tertentu
  const result = await this.prisma.cartItem.deleteMany({
    where: {
      cartId,
      productId,
    },
  });

  // Periksa apakah ada produk yang terhapus
  if (result.count === 0) {
    throw new CartItemNotFoundError();
  }

  // Ambil kembali keranjang setelah penghapusan
  const cart = await this.findById(cartId);

  if (!cart) {
    throw new CartNotFoundError();
  }

  return cart;
}

}
