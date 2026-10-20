
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete
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

@Controller('carts')
export class CartsController {
  constructor(
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addCartItemUseCase: AddCartItemUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly deleteCartItemUseCase: DeleteCartItemUseCase,
  ) {}

  @Get('get-by-id/:id')
  @ResponseMessage('Keranjang berhasil diambil')
  async getCart(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const cart = await this.getCartUseCase.execute(id);

    if (!cart) {
      throw new NotFoundException(
        'Keranjang tidak ditemukan',
      );
    }

    return this.toResponse(cart);
  }

  @Post('add-item')
  @ResponseMessage('Produk berhasil ditambahkan ke keranjang')
  async addItem(@Body() data: AddCartItemDto) {
    try {
      const cart = await this.addCartItemUseCase.execute(
        data,
      );

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
    async updateItem(@Body() data: UpdateCartItemDto) {
    try {
        const cart = await this.updateCartItemUseCase.execute(
        data,
        );

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
