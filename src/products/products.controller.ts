import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { GetProductsUseCase } from
  '../application/use-cases/get-products.use-case';

import { CreateProductUseCase } from
  '../application/use-cases/create-product.use-case';

import { CreateProductDto } from
  './dto/create-product.dto';

import { ResponseMessage } from
  '../common/decorators/response-message.decorator';

import { SearchProductsUseCase } from
  '../application/use-cases/search-products.use-case';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { SellerAccountRequiredError } from
  '../domain/errors/seller.errors';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
  ) {}

  @Get('get-all')
  @ResponseMessage('Daftar produk berhasil diambil')
  getAllProducts() {
    return this.getProductsUseCase.execute();
  }

  @Get('search')
  @ResponseMessage('Hasil pencarian produk berhasil diambil')
  searchProducts(@Query('query') query: string) {
    return this.searchProductsUseCase.execute(query);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Produk berhasil ditambahkan')
  async createProduct(
    @Body() data: CreateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.createProductUseCase.execute(
        data,
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
