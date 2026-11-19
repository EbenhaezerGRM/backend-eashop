import { Injectable } from '@nestjs/common';

import { OrderRepository } from
  '../../domain/repositories/order.repository';

import type {
  CreateOrderInput,
  CreatedOrder,
  OrderSummary,
  OrderDetail,
  CancelledOrder,
} from '../../domain/repositories/order.repository';

import { CartNotFoundError } from
  '../../domain/errors/cart.errors';

import { InvalidPromoSelectionError } from
  '../../domain/errors/promo.errors';

import {
  OrderAddressNotFoundError,
  OrderCartEmptyError,
  OrderCartChangedError,
  OrderInsufficientStockError,
  OrderPromoUnavailableError,
  OrderNotFoundError,
  OrderCannotBeCancelledError,
} from '../../domain/errors/order.errors';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaOrderRepository extends OrderRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  // ==========================================
  // 1. CREATE ORDER
  // ==========================================

  async createFromCheckout(
    data: CreateOrderInput,
  ): Promise<CreatedOrder> {

    return this.prisma.$transaction(async (tx) => {

      // Ambil cart milik user beserta produknya.
      const cart = await tx.cart.findFirst({
        where: {
          id: data.cartId,
          userId: data.userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        throw new CartNotFoundError();
      }

      if (cart.items.length === 0) {
        throw new OrderCartEmptyError();
      }

      // Pastikan alamat milik user.
      const address = await tx.address.findFirst({
        where: {
          id: data.addressId,
          userId: data.userId,
        },
        select: {
          id: true,
        },
      });

      if (!address) {
        throw new OrderAddressNotFoundError();
      }

      // Pastikan cart tidak berubah sejak checkout.
      const requestedItems = new Map<
        number,
        CreateOrderInput['items'][number]
      >();

      for (const item of data.items) {
        requestedItems.set(item.productId, item);
      }

      if (
        requestedItems.size !== data.items.length ||
        data.items.length !== cart.items.length
      ) {
        throw new OrderCartChangedError();
      }

      for (const cartItem of cart.items) {
        const requestedItem = requestedItems.get(
          cartItem.productId,
        );

        if (
          !requestedItem ||
          requestedItem.quantity !== cartItem.quantity ||
          requestedItem.unitPrice !== cartItem.product.price ||
          requestedItem.lineSubtotal !==
            cartItem.product.price * cartItem.quantity
        ) {
          throw new OrderCartChangedError();
        }
      }

      // Kurangi stok produk secara atomik.
      for (const item of cart.items) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new OrderInsufficientStockError(
            item.product.name,
          );
        }
      }

      // Kurangi stok promo secara atomik.
      // Kurangi stok dan periksa penggunaan promo
      // di dalam transaksi yang sama.
      const now = new Date();

      // Urutkan berdasarkan ID agar urutan penguncian
      // baris promo konsisten dan mengurangi risiko deadlock.
      const sortedPromos = [...data.promos].sort(
        (a, b) => a.promoId - b.promoId,
      );

      for (const promo of sortedPromos) {
        // 1. Kurangi stok promo secara atomik.
        const promoUpdate = await tx.promo.updateMany({
          where: {
            id: promo.promoId,
            stock: {
              gte: 1,
            },
            startsAt: {
              lte: now,
            },
            endsAt: {
              gt: now,
            },
          },
          data: {
            stock: {
              decrement: 1,
            },
          },
        });

        if (promoUpdate.count !== 1) {
          throw new OrderPromoUnavailableError(
            promo.promoId,
          );
        }

        // 2. FREE_SHIPPING boleh digunakan berulang kali.
        if (promo.voucherType === 'FREE_SHIPPING') {
          continue;
        }

        // 3. Periksa apakah user pernah menggunakan
        // promo diskon yang sama pada order sebelumnya.
        const existingOrder = await tx.order.findFirst({
          where: {
            userId: data.userId,
            status: {
              not: 'CANCELLED',
            },
            promos: {
              some: {
                promoId: promo.promoId,
              },
            },
          },
          select: {
            id: true,
          },
        });

        if (existingOrder) {
          throw new InvalidPromoSelectionError(
            'Kamu sudah pernah menggunakan promo ini',
          );
        }
      }

      // Simpan Order, OrderItem, dan OrderPromo.
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          addressId: data.addressId,
          status: 'PENDING',

          subtotal: data.subtotal,
          productDiscount: data.productDiscount,
          shippingService: data.shippingService,
          shippingCost: data.shippingCost,
          shippingDiscount: data.shippingDiscount,
          totalPayable: data.totalPayable,

          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
              lineSubtotal:
                item.product.price * item.quantity,
            })),
          },

          promos: {
            create: data.promos.map((promo) => ({
              source: promo.source,
              voucherType: promo.voucherType,
              discountAmount: promo.discountAmount,
              promo: {
                connect: {
                  id: promo.promoId,
                },
              },
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Kosongkan cart satu kali setelah order dibuat.
      await tx.cartItem.deleteMany({
        where: {
          cartId: data.cartId,
        },
      });

      // Kembalikan hasil order.
      return {
        id: order.id,
        userId: order.userId,
        addressId: order.addressId,
        status: order.status,

        subtotal: order.subtotal,
        productDiscount: order.productDiscount,
        shippingService: order.shippingService,
        shippingCost: order.shippingCost,
        shippingDiscount: order.shippingDiscount,
        totalPayable: order.totalPayable,

        createdAt: order.createdAt,

        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineSubtotal: item.lineSubtotal,
        })),
      };
    });
  }

  // ==========================================
  // 2. GET ORDER HISTORY
  // ==========================================

  async findManyByUserId(
    userId: number,
  ): Promise<OrderSummary[]> {

    const orders = await this.prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      productDiscount: order.productDiscount,
      shippingService: order.shippingService,
      shippingCost: order.shippingCost,
      shippingDiscount: order.shippingDiscount,
      totalPayable: order.totalPayable,
      createdAt: order.createdAt,

      items: order.items.map((item) => ({
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineSubtotal: item.lineSubtotal,
      })),
    }));
  }

  // ==========================================
  // 3. GET ORDER DETAIL
  // ==========================================

  async findByIdAndUserId(
    id: number,
    userId: number,
  ): Promise<OrderDetail | null> {

    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: true,
        address: true,
        promos: {
          include: {
            promo: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      userId: order.userId,
      addressId: order.addressId,
      status: order.status,

      subtotal: order.subtotal,
      productDiscount: order.productDiscount,
      shippingService: order.shippingService,
      shippingCost: order.shippingCost,
      shippingDiscount: order.shippingDiscount,
      totalPayable: order.totalPayable,
      createdAt: order.createdAt,

      items: order.items.map((item) => ({
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineSubtotal: item.lineSubtotal,
      })),

      address: {
        id: order.address.id,
        recipientName: order.address.recipientName,
        phone: order.address.phone,
        street: order.address.street,
        city: order.address.city,
        province: order.address.province,
        district: order.address.district,
        postalCode: order.address.postalCode,
        notes: order.address.notes,
      },

      promos: order.promos.map((promo) => ({
        promoId: promo.promoId,
        source: promo.source,
        voucherType: promo.voucherType,
        discountAmount: promo.discountAmount,
        promoName: promo.promo.name,
      })),
    };
  }

  // ==========================================
  // 4. CANCEL ORDER
  // ==========================================

  async cancelPendingOrder(
    id: number,
    userId: number,
  ): Promise<CancelledOrder> {

    return this.prisma.$transaction(async (tx) => {

      // Cari order milik user.
      const order = await tx.order.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          items: true,
          promos: true,
        },
      });

      if (!order) {
        throw new OrderNotFoundError();
      }

      // Hanya order PENDING yang boleh dibatalkan.
      if (order.status !== 'PENDING') {
        throw new OrderCannotBeCancelledError();
      }

      // Ubah status secara atomik.
      // Mencegah stok dikembalikan dua kali.
      const updated = await tx.order.updateMany({
        where: {
          id,
          userId,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      });

      if (updated.count !== 1) {
        throw new OrderCannotBeCancelledError();
      }

      // Kembalikan stok produk.
      for (const item of order.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Kembalikan stok promo.
      for (const promo of order.promos) {
        await tx.promo.update({
          where: {
            id: promo.promoId,
          },
          data: {
            stock: {
              increment: 1,
            },
          },
        });
      }

      return {
        id: order.id,
        status: 'CANCELLED',
      };
    });
  }

  async hasUserUsedPromo(
  userId: number,
  promoId: number,
): Promise<boolean> {
  const existingOrder = await this.prisma.order.findFirst({
    where: {
      userId,
      status: {
        not: 'CANCELLED',
      },
      promos: {
        some: {
          promoId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return existingOrder !== null;
}
}
