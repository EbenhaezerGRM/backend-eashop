import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';
import { PromosModule } from './promos/promos.module';
import { CheckoutModule } from './checkout/checkout.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payment.module';
import { SellersModule } from './sellers/sellers.module';


@Module({
  imports: [ProductsModule, CartsModule, PromosModule, CheckoutModule, AuthModule, OrdersModule, PaymentsModule, SellersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
