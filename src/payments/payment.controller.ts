
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { DummyPayOrderUseCase } from
  '../application/use-cases/dummy-pay-order.use-case';

import { DummyFailOrderUseCase } from
  '../application/use-cases/dummy-fail-order.use-case';

import { GetOrderPaymentsUseCase } from
  '../application/use-cases/get-order-payments.use-case';

import { DummyPaymentDto } from './dto/dummy-payment.dto';

import {
  PaymentOrderNotFoundError,
  PaymentOrderNotPayableError,
} from '../domain/errors/payment.errors';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly dummyPayOrderUseCase: DummyPayOrderUseCase,
    private readonly dummyFailOrderUseCase: DummyFailOrderUseCase,
    private readonly getOrderPaymentsUseCase: GetOrderPaymentsUseCase,
  ) {}

  private handleError(error: unknown): never {
    if (error instanceof PaymentOrderNotFoundError) {
      throw new NotFoundException(error.message);
    }

    if (error instanceof PaymentOrderNotPayableError) {
      throw new ConflictException(error.message);
    }

    throw error;
  }

  @Post('dummy/pay')
  @HttpCode(HttpStatus.OK)
  async pay(
    @Body() dto: DummyPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.dummyPayOrderUseCase.execute(
        dto.orderId,
        req.user.sub,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('dummy/fail')
  @HttpCode(HttpStatus.OK)
  async fail(
    @Body() dto: DummyPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.dummyFailOrderUseCase.execute(
        dto.orderId,
        req.user.sub,
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('order/:orderId')
  async getOrderPayments(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.getOrderPaymentsUseCase.execute(
        orderId,
        req.user.sub,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}
