import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from './mailer/mailer.module';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { Brand } from './brand/entities/brand.entity';
import { Category } from './category/entities/category.entity';
import { Product } from './product/entities/product.entity';
import { ProductImage } from './product/entities/product-image.entity';

@Module({
  imports: [UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_URL'), 
        
        entities: [
          User, PasswordResetToken, Brand, Category, Product, ProductImage
        ],
        
        synchronize: process.env.NODE_ENV !== 'production', 
        
        ssl: {
          rejectUnauthorized: false, 
        },
      }),
    }),
    MailerModule,
    ProductModule,
    BrandModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
