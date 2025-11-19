import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/product/entities/product.entity';
import { RedisModule } from 'src/redis/redis.module';
import { CartService } from './cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product]),
    RedisModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule { }
