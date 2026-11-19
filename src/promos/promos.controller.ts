
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { CreatePromoUseCase } from
  '../application/use-cases/create-promo.use-case';

import { GetPromosUseCase } from
  '../application/use-cases/get-promos.use-case';

import { InvalidPromoInputError } from
  '../domain/errors/promo.errors';

import { SellerAccountRequiredError } from
  '../domain/errors/seller.errors';

import { ResponseMessage } from
  '../common/decorators/response-message.decorator';

import { CreatePromoDto } from './dto/create-promo.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('promos')
export class PromosController {
  constructor(
    private readonly createPromoUseCase: CreatePromoUseCase,
    private readonly getPromosUseCase: GetPromosUseCase,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Promo berhasil dibuat')
  async createPromo(
    @Body() data: CreatePromoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const promo = await this.createPromoUseCase.execute({
        name: data.name,
        voucherType: data.voucherType,
        stock: data.stock,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumPurchase: data.minimumPurchase,
        maximumDiscount: data.maximumDiscount,
        shippingDiscountTiers: data.shippingDiscountTiers,
        isStackable: data.isStackable,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
      }, req.user.sub);

      return promo.config;
    } catch (error) {
      if (error instanceof InvalidPromoInputError) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof SellerAccountRequiredError) {
        throw new ForbiddenException(error.message);
      }

      throw error;
    }
  }

  @Get('get-all')
  @ResponseMessage('Daftar promo berhasil diambil')
  async getAllPromos() {
    const promos = await this.getPromosUseCase.execute();

    return promos.map((promo) => promo.config);
  }
}
