import { Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "./entities/category.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";


@Injectable()
export class CategoryService{
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }
    
    async findBySlug(slug: string): Promise<Category>{
        const category = await this.categoryRepository.findOneBy({
            slug: slug,
        })

        if (!category) {
            throw new NotFoundException(`Category with slug "${slug}" not found.`);
        }
        
        return category;
    }

    async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
        order: { id: 'ASC' } 
    });
}

    async findByName(name: string): Promise<Category[]>{
        const categories = await this.categoryRepository.createQueryBuilder('category')
            .where('category.name ILIKE :searchName', { searchName: `%${name}%` })
            .getMany()
        return categories;
    }
}