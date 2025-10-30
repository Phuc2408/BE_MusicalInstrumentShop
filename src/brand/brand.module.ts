import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandService } from './brand.service';
@Module({
    imports: [TypeOrmModule.forFeature([Brand])],
    providers: [BrandService],
    exports:[BrandService,]
})
export class BrandModule {}
