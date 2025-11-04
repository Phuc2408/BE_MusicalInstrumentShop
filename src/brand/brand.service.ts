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

    async findAll(): Promise<Brand[]> {
        return this.brandRepository.find();
    }

    async findBySlug(slug: string): Promise<Brand>{
            const brand = await this.brandRepository.findOneBy({
                slug: slug,
            })
    
            if (!brand) {
                throw new NotFoundException(`Brand with slug "${slug}" not found.`);
            }
            
            return brand;
        }

    async findByName(name: string): Promise<Brand[]>{
        const brands = await this.brandRepository.createQueryBuilder('brand')
            .where('brand.name ILIKE :searchName', { searchName: `%${name}%` })
            .getMany()
        return brands;
    }
}