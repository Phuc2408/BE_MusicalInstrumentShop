import { Injectable } from "@nestjs/common";
import { Category } from "./entities/category.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class CategoryService{
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    async findByName(name: string): Promise<Category[]>{
        const categories = await this.categoryRepository.createQueryBuilder('category')
            .where('category.name ILIKE :searchName', { searchName: `%${name}%` })
            .getMany()
        return categories;
    }
}