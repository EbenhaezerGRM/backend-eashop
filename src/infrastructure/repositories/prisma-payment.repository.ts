
import { PrismaService } from '../database/prisma.service';

import {
  PaymentRepository,
  PaymentRecord,
} from '../../domain/repositories/payment.repository';

import {
  PaymentOrderNotFoundError,
  PaymentOrderNotPayableError,
} from '../../domain/errors/payment.errors';

export class PrismaPaymentRepository extends PaymentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async payOrder(
    orderId: number,
    userId: number,
  ): Promise<PaymentRecord> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        select: {
          id: true,
          status: true,
          totalPayable: true,
        },
      });

      if (!order) {
        throw new PaymentOrderNotFoundError();
      }

      if (order.status !== 'PENDING') {
        throw new PaymentOrderNotPayableError();
      }

      // Hanya satu request yang boleh mengubah PENDING menjadi PAID.
      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          userId,
          status: 'PENDING',
        },
        data: {
          status: 'PAID',
        },
      });

      if (updated.count !== 1) {
        throw new PaymentOrderNotPayableError();
      }

      return tx.payment.create({
        data: {
          orderId,
          provider: 'DUMMY',
          status: 'SUCCESS',
          amount: order.totalPayable,
          paidAt: new Date(),
        },
      });
    });
  }

  async failOrder(
    orderId: number,
    userId: number,
  ): Promise<PaymentRecord> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        select: {
          id: true,
          status: true,
          totalPayable: true,
        },
      });

      if (!order) {
        throw new PaymentOrderNotFoundError();
      }

      if (order.status !== 'PENDING') {
        throw new PaymentOrderNotPayableError();
      }

      // Mengunci kondisi pesanan agar tidak mencatat kegagalan
      // setelah pesanan sudah dibayar atau dibatalkan.
      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          userId,
          status: 'PENDING',
        },
        data: {
          updatedAt: new Date(),
        },
      });

      if (updated.count !== 1) {
        throw new PaymentOrderNotPayableError();
      }

      return tx.payment.create({
        data: {
          orderId,
          provider: 'DUMMY',
          status: 'FAILED',
          amount: order.totalPayable,
          failureReason: 'Simulasi pembayaran gagal',
        },
      });
    });
  }

  async findPaymentsByOrder(
    orderId: number,
    userId: number,
  ): Promise<PaymentRecord[]> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!order) {
      throw new PaymentOrderNotFoundError();
    }

    return this.prisma.payment.findMany({
      where: {
        orderId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
