
import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { JwtAuthGuard } from
  '../auth/jwt-auth.guard';

import { GetMyOrdersUseCase } from
  '../application/use-cases/get-my-orders.use-case';

import { GetOrderDetailUseCase } from
  '../application/use-cases/get-order-detail.use-case';

import { CancelOrderUseCase } from
  '../application/use-cases/cancel-order.use-case';

import {
  OrderNotFoundError,
  OrderCannotBeCancelledError,
} from '../domain/errors/order.errors';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly getMyOrdersUseCase: GetMyOrdersUseCase,
    private readonly getOrderDetailUseCase: GetOrderDetailUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  // GET /orders/me
  @Get('me')
  getMyOrders(
    @Req() req: AuthenticatedRequest,
  ) {
    return this.getMyOrdersUseCase.execute(
      req.user.sub,
    );
  }

  // GET /orders/:id
  @Get(':id')
  async getOrderDetail(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const order = await this.getOrderDetailUseCase.execute(
      id,
      req.user.sub,
    );

    if (!order) {
      throw new NotFoundException(
        'Pesanan tidak ditemukan',
      );
    }

    return order;
  }

  // PATCH /orders/:id/cancel
  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.cancelOrderUseCase.execute(
        id,
        req.user.sub,
      );
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof OrderCannotBeCancelledError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }
}
