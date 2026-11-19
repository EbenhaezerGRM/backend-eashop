
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
  ValidationPipe 
} from '@nestjs/common';

import { GetSellerPromosDto } from
  './dto/get-seller-promos.dto';

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
    role?: 'USER' | 'ADMIN';
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
async createPromo(
  @Body() data: CreatePromoDto,
  @Req() req: AuthenticatedRequest,
) {
  // Validasi ADMIN untuk promo PLATFORM
  if (data.source === 'PLATFORM' && req.user.role !== 'ADMIN') {
    throw new ForbiddenException(
      'Hanya ADMIN yang dapat membuat promo PLATFORM',
    );
  }

  try {
    // Pemanggilan use case yang baru
    const promo = await this.createPromoUseCase.execute(
      {
        name: data.name,
        source: data.source,
        sellerId: data.sellerId ?? null,
        voucherType: data.voucherType,
        stock: data.stock,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumPurchase: data.minimumPurchase,
        maximumDiscount: data.maximumDiscount,
        shippingDiscountTiers: data.shippingDiscountTiers ?? null,
        isStackable: data.isStackable,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
      },
      req.user.sub,
    );

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

  @Post('seller')
  @ResponseMessage('Voucher seller berhasil diambil')
  async getSellerPromos(
    @Body(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: GetSellerPromosDto,
  ) {
    const promos = await this.getPromosUseCase.executeBySellerId(
      dto.sellerId,
    );

    return promos.map((promo) => promo.config);
  }

  @Get('platform')
  @ResponseMessage('Voucher platform berhasil diambil')
  async getPlatformPromos() {
    const promos = await this.getPromosUseCase.executeBySource(
      'PLATFORM',
    );

    return promos.map((promo) => promo.config);
  }
}
