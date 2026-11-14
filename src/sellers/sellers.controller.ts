
import {
  Body,
  ConflictException,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CreateSellerAccountUseCase } from
  '../application/use-cases/create-seller-account.use-case';

import { CreateSellerDto } from './dto/create-seller.dto';

import { SellerAlreadyExistsError } from
  '../domain/errors/seller.errors';

import { ResponseMessage } from
  '../common/decorators/response-message.decorator';

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
}
