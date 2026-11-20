import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CheckoutUseCase } from
  '../application/use-cases/checkout-use-case';

import { ValidatePromosUseCase } from
  '../application/use-cases/validate-promos.use-case';

import { CheckoutPreviewDto } from
  './dto/checkout-preview.dto';

import { ValidatePromosDto } from
  './dto/validate-promos.dto';

import { JwtAuthGuard } from
  '../auth/jwt-auth.guard';

import { CreateOrderUseCase } from
  '../application/use-cases/create-order.use-case';

import { CreateOrderDto } from
  './dto/create-order.dto';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(
    private readonly checkoutUseCase: CheckoutUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly validatePromosUseCase:
      ValidatePromosUseCase,
  ) {}

  @Post('validate-promos')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  validatePromos(
    @Body() dto: ValidatePromosDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.validatePromosUseCase.execute({
      cartId: dto.cartId,
      userId: req.user.sub,
      selectedPromoIds: dto.selectedPromoIds,
      promoIdsToValidate: dto.promoIdsToValidate,
      shippingServiceType: dto.shippingServiceType,
      evaluationDate: new Date(),
    });
  }

  @Post('create')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(
    @Body() dto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.createOrderUseCase.execute({
      cartId: dto.cartId,
      userId: req.user.sub,
      addressId: dto.addressId,
      promoIds: dto.promoIds ?? [],
      shippingServiceType: dto.shippingServiceType,
      evaluationDate: new Date(),
    });
  }

  @Post('preview')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  preview(
    @Body() dto: CheckoutPreviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.checkoutUseCase.execute({
      cartId: dto.cartId,
      userId: req.user.sub,
      promoIds: dto.promoIds ?? [],
      shippingServiceType: dto.shippingServiceType,
      evaluationDate: new Date(),
    });
  }
}
