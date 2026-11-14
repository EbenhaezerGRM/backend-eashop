import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { GetCartUseCase } from
  '../application/use-cases/get-cart.use-case';

import { UpdateCartItemUseCase } from
  '../application/use-cases/update-cart-item.use-case';

import { UpdateCartItemDto } from
  './dto/update-cart-item.dto';

import { AddCartItemUseCase } from
  '../application/use-cases/add-cart-item.use-case';

import {
  CartNotFoundError,
  ProductNotFoundError,
  InsufficientStockError,
  InvalidCartQuantityError,
  CartItemNotFoundError,
} from '../domain/errors/cart.errors';

import { Cart } from '../domain/entities/cart.entity';

import { ResponseMessage } from
  '../common/decorators/response-message.decorator';

import { AddCartItemDto } from './dto/add-cart-item.dto';

import { DeleteCartItemUseCase } from
  '../application/use-cases/delete-cart-item.use-case';

import { JwtAuthGuard } from
  '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addCartItemUseCase: AddCartItemUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly deleteCartItemUseCase: DeleteCartItemUseCase,
  ) {}

  // Mengambil cart milik user yang sedang login.
  @Get('me')
  @ResponseMessage('Keranjang berhasil diambil')
  async getMyCart(@Req() req: AuthenticatedRequest) {
    const cart = await this.getCartUseCase.executeByUserId(
      req.user.sub,
    );

    if (!cart) {
      throw new NotFoundException(
        'Keranjang belum tersedia',
      );
    }

    return this.toResponse(cart);
  }

  // Mengambil cart berdasarkan ID, dengan validasi kepemilikan.
  @Get('get-by-id/:id')
  @ResponseMessage('Keranjang berhasil diambil')
  async getCart(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const cart = await this.getCartUseCase.executeForUser(
      id,
      req.user.sub,
    );

    if (!cart) {
      throw new NotFoundException(
        'Keranjang tidak ditemukan',
      );
    }

    return this.toResponse(cart);
  }

  @Post('add-item')
  @ResponseMessage('Produk berhasil ditambahkan ke keranjang')
  async addItem(
    @Body(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )
    data: AddCartItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const cart = await this.addCartItemUseCase.execute({
        ...data,
        userId: req.user.sub,
      });

      return this.toResponse(cart);
    } catch (error) {
      if (
        error instanceof CartNotFoundError ||
        error instanceof ProductNotFoundError
      ) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof InsufficientStockError) {
        throw new ConflictException(error.message);
      }

      if (error instanceof InvalidCartQuantityError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Patch('update-item')
  @ResponseMessage('Jumlah produk berhasil diperbarui')
  async updateItem(
    @Body(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )
    data: UpdateCartItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const cart = await this.updateCartItemUseCase.execute({
        ...data,
        userId: req.user.sub,
      });

      return this.toResponse(cart);
    } catch (error) {
      if (
        error instanceof CartNotFoundError ||
        error instanceof CartItemNotFoundError ||
        error instanceof ProductNotFoundError
      ) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof InsufficientStockError) {
        throw new ConflictException(error.message);
      }

      if (error instanceof InvalidCartQuantityError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Delete('delete-item/:cartId/:productId')
  @ResponseMessage('Produk berhasil dihapus dari keranjang')
  async deleteItem(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    if (cartId <= 0 || productId <= 0) {
      throw new BadRequestException(
        'ID keranjang dan produk harus lebih besar dari 0',
      );
    }

    try {
      const cart = await this.deleteCartItemUseCase.execute({
        cartId,
        productId,
        userId: req.user.sub,
      });

      return this.toResponse(cart);
    } catch (error) {
      if (
        error instanceof CartNotFoundError ||
        error instanceof CartItemNotFoundError
      ) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  private toResponse(cart: Cart) {
    return {
      cartId: cart.id,
      userId: cart.userId,

      items: cart.getItems().map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        category: item.product.category,
        quantity: item.quantity,
        availableStock: item.product.stock,
        remainingStock: item.getRemainingStock(),
        subtotal: item.getSubtotal(),
      })),

      total: cart.getTotal(),
    };
  }
}