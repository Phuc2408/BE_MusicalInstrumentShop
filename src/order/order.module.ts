// order/order.module.ts

import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from 'src/cart/cart.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    CartModule,
    TypeOrmModule.forFeature([Order]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
  ],
  exports: [OrderService]
})
export class OrderModule { }