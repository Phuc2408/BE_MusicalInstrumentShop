import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { BrandModule } from 'src/brand/brand.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    BrandModule,
    CategoryModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
