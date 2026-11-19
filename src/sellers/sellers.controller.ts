import {
  Body,
  ConflictException,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
  Delete,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CreateSellerAccountUseCase } from
  '../application/use-cases/create-seller-account.use-case';

import { GetSellerProductsUseCase } from
  '../application/use-cases/get-seller-product.use-case';

import { GetSellerPromosUseCase } from
  '../application/use-cases/get-seller-promos.use-case';

import { CreateSellerDto } from './dto/create-seller.dto';

import {
  SellerAlreadyExistsError,
  SellerAccountRequiredError,
} from '../domain/errors/seller.errors';

import { ResponseMessage } from
  '../common/decorators/response-message.decorator';

import { DeleteSellerProductUseCase } from '../application/use-cases/delete-seller-product.use-case';

import {
  ProductNotFoundError,
  ProductCannotBeDeletedError,
} from '../domain/errors/product.errors';

import { DeleteSellerPromoUseCase } from
  '../application/use-cases/delete-seller-promo.use-case';

import {
  SellerPromoNotFoundError,
  SellerPromoCannotBeDeletedError,
} from '../domain/errors/seller-promo.errors';

import { GetMySellerProfileUseCase } from
  '../application/use-cases/get-my-seller-profile.use-case';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('sellers')
@UseGuards(JwtAuthGuard)
export class SellersController {
  constructor(
    private readonly createSellerAccountUseCase:
      CreateSellerAccountUseCase,

    private readonly getSellerProductsUseCase:
      GetSellerProductsUseCase,

    private readonly getSellerPromosUseCase:
      GetSellerPromosUseCase,

    private readonly deleteSellerProductUseCase: DeleteSellerProductUseCase,

    private readonly deleteSellerPromoUseCase: DeleteSellerPromoUseCase,

    private readonly getMySellerProfileUseCase:GetMySellerProfileUseCase,
  ) {}

  @Post('register')
  @ResponseMessage('Akun Seller berhasil dibuat')
  async register(
    @Body() dto: CreateSellerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.createSellerAccountUseCase.execute({
        userId: req.user.sub,
        storeName: dto.storeName,
        description: dto.description,
      });
    } catch (error) {
      if (error instanceof SellerAlreadyExistsError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Get('me/products')
  @ResponseMessage('Produk toko berhasil diambil')
  async getMyProducts(
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.getSellerProductsUseCase.execute(
        req.user.sub,
      );
    } catch (error) {
      if (error instanceof SellerAccountRequiredError) {
        throw new ForbiddenException(error.message);
      }

      throw error;
    }
  }

  @Get('me/promos')
  @ResponseMessage('Voucher toko berhasil diambil')
  async getMyPromos(
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.getSellerPromosUseCase.execute(
        req.user.sub,
      );
    } catch (error) {
      if (error instanceof SellerAccountRequiredError) {
        throw new ForbiddenException(error.message);
      }

      throw error;
    }
  }

  @Delete('me/products')
  @ResponseMessage('Produk toko berhasil dihapus')
  async deleteMyProduct(
    @Body('productId', ParseIntPipe) productId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      if (productId <= 0) {
        throw new BadRequestException('ID produk tidak valid');
      }

      return await this.deleteSellerProductUseCase.execute(
        req.user.sub,
        productId,
      );
    } catch (error) {
      if (error instanceof SellerAccountRequiredError) {
        throw new ForbiddenException(error.message);
      }

      if (error instanceof ProductNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof ProductCannotBeDeletedError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

    @Delete('me/promos')
  @ResponseMessage('Voucher toko berhasil dihapus')
  async deleteMyPromo(
    @Body('promoId', ParseIntPipe) promoId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      if (promoId <= 0) {
        throw new BadRequestException('ID voucher tidak valid');
      }

      return await this.deleteSellerPromoUseCase.execute(
        req.user.sub,
        promoId,
      );
    } catch (error) {
      if (error instanceof SellerAccountRequiredError) {
        throw new ForbiddenException(error.message);
      }

      if (error instanceof SellerPromoNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof SellerPromoCannotBeDeletedError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Get('me/profile')
@ResponseMessage('Profil toko berhasil diambil')
async getMyProfile(
  @Req() req: AuthenticatedRequest,
) {
  try {
    return await this.getMySellerProfileUseCase.execute(
      req.user.sub,
    );
  } catch (error) {
    if (error instanceof SellerAccountRequiredError) {
      throw new ForbiddenException(error.message);
    }

    throw error;
  }
}
}
