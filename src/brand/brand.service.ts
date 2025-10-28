import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandService{
    constructor(
        @InjectRepository(Brand)
        private readonly brandRepository: Repository<Brand>,
    ) {}

    async findByName(name: string): Promise<number[]>{
        const brands = await this.brandRepository.createQueryBuilder('brand')
            .select('brand.id')
            .where('brand.name ILIKE :searchName', { searchName: `%${name}%` })
            .getMany()
        return brands.map(brand => brand.id);
    }
}